import { Pinecone } from "@pinecone-database/pinecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google";
import type { GitHubFile } from "@coderabbit/types";

// Initialize Pinecone
let pineconeClient: Pinecone | null = null;

export function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export function getPineconeIndex() {
  const client = getPineconeClient();
  return client.index(process.env.PINECONE_INDEX_NAME!);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004"),
    value: text,
  });
  return embedding;
}

export async function indexCodebase(
  repoId: string,
  files: GitHubFile[]
): Promise<void> {
  const pineconeIndex = getPineconeIndex();
  const vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, string>;
  }> = [];

  for (const file of files) {
    const content = `File: ${file.path}\n\n${file.content}`;
    const truncatedContent = content.slice(0, 8000);

    try {
      const embedding = await generateEmbedding(truncatedContent);
      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "-")}`,
        values: embedding,
        metadata: {
          repoId,
          path: file.path,
          content: truncatedContent,
        },
      });
    } catch (error) {
      console.log(`Failed to generate embedding for file ${file.path}:`, error);
    }
  }

  if (vectors.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await pineconeIndex.upsert(batch);
    }
  }

  console.log("Indexing completed. Total vectors indexed:", vectors.length);
}

export async function retrieveContext(
  query: string,
  repoId: string,
  topK: number = 5
): Promise<string[]> {
  const pineconeIndex = getPineconeIndex();
  const embedding = await generateEmbedding(query);

  const results = await pineconeIndex.query({
    vector: embedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });

  return results.matches
    .map((match) => match.metadata?.content as string)
    .filter(Boolean);
}

export async function generateCodeReview(
  diff: string,
  context: string[]
): Promise<string> {
  // Use your AI model to generate review
  // This is a placeholder - implement with your actual AI logic
  const prompt = `
    Review the following code changes:
    
    ${diff}
    
    Context from codebase:
    ${context.join("\n\n")}
    
    Provide a detailed code review with:
    1. Summary of changes
    2. Potential issues
    3. Suggestions for improvement
  `;

  // Implement with your AI SDK
  return prompt; // Replace with actual AI call
}