

import {embed} from "ai";
import {createGoogleGenerativeAI, google}from "@ai-sdk/google";
import { pineconeIndex } from "./pinecone";

// ─── Rate-limiting helpers ──────────────────────────────────────────────────

const RATE_LIMIT_DELAY_MS = 1500; // 1.5 s between embedding calls (Gemini free tier: ~1500 RPM)
const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEmbedding(text: string) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { embedding } = await embed({
        model: google.textEmbeddingModel("gemini-embedding-001"),
        value: text,
        providerOptions: {
          google: {
            outputDimensionality: 768, // matching the existing Pinecone index dimension
          },
        },
      });
      return embedding;
    } catch (error: any) {
      const isRateLimit =
        error?.statusCode === 429 ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.data?.error?.status === "RESOURCE_EXHAUSTED" ||
        error?.isRetryable;

      if (isRateLimit && attempt < MAX_RETRIES - 1) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt); // 2s, 4s, 8s, 16s, 32s
        console.warn(
          `Rate limited (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${backoff}ms...`
        );
        await sleep(backoff);
        continue;
      }
      throw error;
    }
  }
  throw new Error("generateEmbedding: max retries exceeded");
}

export async function indexCodebase(repoId:string, files:{path:string, content:string}[]){
  const vectors = [];

  for (let i = 0; i < files.length; i++){
    const file = files[i];
    const content = `File : ${file.path}\n\n${file.content}`;

    const truncatedContent = content.slice(0, 8000); // Truncate to first 8000 characters

    try {
      const embedding = await generateEmbedding(truncatedContent);
      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "-")}`,
        values: embedding,
        metadata:{
          repoId,
          path:file.path,
          content: truncatedContent,
        }
      })
    } catch (error) {
      console.log(`Failed to generate embedding for file ${file.path}:`, error);
    }

    // Rate-limit: pause between requests to avoid RESOURCE_EXHAUSTED
    if (i < files.length - 1) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }
  if(vectors.length > 0){
    const batchSize = 100;
    for(let i=0; i < vectors.length; i += batchSize){
      const batch = vectors.slice(i, i + batchSize);
      await pineconeIndex.upsert(batch);
    }
  }

  console.log("Indexing completed. Total vectors indexed:", vectors.length);
  return vectors.length;
}

export async function retrieveContext(query:string, repoId:string, topK:number=5){
  const embedding = await generateEmbedding(query);

  const results = await pineconeIndex.query({
    vector:embedding,
    filter:{repoId},
    topK,
    includeMetadata:true,
  });

  return results.matches.map(match=> match.metadata?.content as string).filter(Boolean);
}

// ─── Feature 3: Delta Re-Indexing on Push ───────────────────────────────────

/**
 * Update the vector index with only changed files (delta indexing).
 * Much faster than full re-index — only processes files that changed in a push.
 */
export async function updateCodebaseIndex(
  repoId: string,
  changedFiles: { path: string; content: string }[],
  removedPaths: string[]
) {
  // Delete vectors for removed files
  if (removedPaths.length > 0) {
    const idsToDelete = removedPaths.map(
      (p) => `${repoId}-${p.replace(/\//g, "-")}`
    );
    try {
      await pineconeIndex.deleteMany(idsToDelete);
      console.log(`Deleted ${idsToDelete.length} vectors for removed files`);
    } catch (error) {
      console.error("Failed to delete vectors for removed files:", error);
    }
  }

  // Index changed/added files (same logic as indexCodebase but for delta)
  if (changedFiles.length > 0) {
    const vectors = [];
    for (let i = 0; i < changedFiles.length; i++) {
      const file = changedFiles[i];
      const content = `File : ${file.path}\n\n${file.content}`;
      const truncatedContent = content.slice(0, 8000);
      try {
        const embedding = await generateEmbedding(truncatedContent);
        vectors.push({
          id: `${repoId}-${file.path.replace(/\//g, "-")}`,
          values: embedding,
          metadata: { repoId, path: file.path, content: truncatedContent },
        });
      } catch (error) {
        console.log(`Failed to generate embedding for file ${file.path}:`, error);
      }

      // Rate-limit: pause between requests to avoid RESOURCE_EXHAUSTED
      if (i < changedFiles.length - 1) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    }

    if (vectors.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        await pineconeIndex.upsert(vectors.slice(i, i + batchSize));
      }
    }

    console.log(`Delta indexing completed. Updated ${vectors.length} vectors`);
    return vectors.length;
  }

  return 0;
}

/**
 * Delete all vectors for a given repository.
 * Used when disconnecting a repo to clean up Pinecone.
 */
export async function deleteRepoVectors(repoId: string) {
  try {
    // Pinecone supports deleteMany with a filter
    await pineconeIndex.deleteMany({ repoId });
    console.log(`Deleted all vectors for repo: ${repoId}`);
  } catch (error) {
    console.error(`Failed to delete vectors for repo ${repoId}:`, error);
  }
}