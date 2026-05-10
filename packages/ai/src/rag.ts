/**
 * RAG (Retrieval-Augmented Generation) pipeline — powered by LangChain.
 *
 * Uses:
 *  - LangChain RecursiveCharacterTextSplitter for language-aware code chunking
 *  - Vercel AI SDK embedMany for fast batch embedding (Gemini 768-dim)
 *  - Pinecone for vector storage and retrieval
 *  - Vercel AI SDK for text generation (doc generation)
 */

import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { pineconeIndex } from "./pinecone";

// ─── Embedding Helpers ──────────────────────────────────────────────────────

/** Delay between batches — kept low since batch calls are efficient */
const BATCH_DELAY_MS = 300;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch-embed texts using Vercel AI SDK's embedMany.
 * Processes in sub-batches of 100 (Gemini limit) with brief delays.
 */
async function batchEmbed(texts: string[]): Promise<number[][]> {
  const SUB_BATCH = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += SUB_BATCH) {
    const batch = texts.slice(i, i + SUB_BATCH);
    const { embeddings: batchResult } = await embedMany({
      model: google.textEmbeddingModel("gemini-embedding-001"),
      values: batch,
      providerOptions: {
        google: { outputDimensionality: 768 },
      },
    });
    allEmbeddings.push(...batchResult);

    if (i + SUB_BATCH < texts.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return allEmbeddings;
}

// Custom LangChain Embeddings (wraps Vercel AI SDK for exact 768-dim compat)

class GeminiEmbeddings extends Embeddings {
  constructor(params?: EmbeddingsParams) {
    super({ maxRetries: 5, ...(params ?? {}) });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return batchEmbed(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.caller.call(async () => {
      const { embedding } = await embed({
        model: google.textEmbeddingModel("gemini-embedding-001"),
        value: text,
        providerOptions: {
          google: { outputDimensionality: 768 },
        },
      });
      return embedding;
    });
  }
}

// Shared singleton — LangChain's built-in `this.caller` handles retries + backoff
const embeddings = new GeminiEmbeddings();

// ─── Language-Aware Text Splitters ──────────────────────────────────────────

const CHUNK_SIZE = 4000;
const CHUNK_OVERLAP = 400;

const JS_EXTS = new Set(["ts", "tsx", "js", "jsx", "mjs", "cjs", "vue", "svelte"]);
const PY_EXTS = new Set(["py", "pyx", "pyi"]);
const GO_EXTS = new Set(["go"]);
const JAVA_EXTS = new Set(["java", "kt", "kts"]);
const RUST_EXTS = new Set(["rs"]);
const RUBY_EXTS = new Set(["rb"]);
const PHP_EXTS = new Set(["php"]);
const CPP_EXTS = new Set(["c", "cpp", "cc", "h", "hpp"]);
const MD_EXTS = new Set(["md", "mdx"]);
const HTML_EXTS = new Set(["html", "htm", "xml"]);

type SplitterLanguage = Parameters<typeof RecursiveCharacterTextSplitter.fromLanguage>[0];

const LANG_MAP: [Set<string>, SplitterLanguage][] = [
  [JS_EXTS, "js"],
  [PY_EXTS, "python"],
  [GO_EXTS, "go"],
  [JAVA_EXTS, "java"],
  [RUST_EXTS, "rust"],
  [RUBY_EXTS, "ruby"],
  [PHP_EXTS, "php"],
  [CPP_EXTS, "cpp"],
  [MD_EXTS, "markdown"],
  [HTML_EXTS, "html"],
];

function getSplitterForFile(filePath: string): RecursiveCharacterTextSplitter {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  for (const [exts, lang] of LANG_MAP) {
    if (exts.has(ext)) {
      return RecursiveCharacterTextSplitter.fromLanguage(lang, {
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
      });
    }
  }
  return new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
}

// ─── Exported: generateEmbedding (kept for backward compat) ─────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  return embeddings.embedQuery(text);
}

// ─── Exported: indexCodebase ────────────────────────────────────────────────

export async function indexCodebase(
  repoId: string,
  files: { path: string; content: string }[]
) {
  // Phase 1: Chunk all files (CPU-only, very fast)
  const allChunks: { text: string; path: string; chunkIndex: number }[] = [];

  for (const file of files) {
    if (!file) continue;
    const fullContent = `File: ${file.path}\n\n${file.content}`;
    const splitter = getSplitterForFile(file.path);
    const chunks = await splitter.splitText(fullContent);

    for (let ci = 0; ci < chunks.length; ci++) {
      allChunks.push({ text: chunks[ci]!, path: file.path, chunkIndex: ci });
    }
  }

  console.log(`[Indexing] Chunked ${files.length} files → ${allChunks.length} chunks`);

  // Phase 2: Batch embed all chunks (100 per API call)
  const EMBED_BATCH = 100;
  const vectors: {
    id: string;
    values: number[];
    metadata: { repoId: string; path: string; content: string; chunkIndex: number };
  }[] = [];

  for (let i = 0; i < allChunks.length; i += EMBED_BATCH) {
    const batch = allChunks.slice(i, i + EMBED_BATCH);
    const texts = batch.map((c) => c.text);

    try {
      const batchEmbeddings = await batchEmbed(texts);

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j]!;
        const safePathPart = chunk.path.replace(/\//g, "-");
        vectors.push({
          id: `${repoId}-${safePathPart}-chunk-${chunk.chunkIndex}`,
          values: batchEmbeddings[j]!,
          metadata: {
            repoId,
            path: chunk.path,
            content: chunk.text,
            chunkIndex: chunk.chunkIndex,
          },
        });
      }
    } catch (error) {
      console.error(`[Indexing] Batch embed failed at ${i}, falling back to sequential:`, error);
      for (const chunk of batch) {
        try {
          const emb = await embeddings.embedQuery(chunk.text);
          const safePathPart = chunk.path.replace(/\//g, "-");
          vectors.push({
            id: `${repoId}-${safePathPart}-chunk-${chunk.chunkIndex}`,
            values: emb,
            metadata: {
              repoId,
              path: chunk.path,
              content: chunk.text,
              chunkIndex: chunk.chunkIndex,
            },
          });
        } catch (err) {
          console.log(`Failed to embed ${chunk.path} chunk ${chunk.chunkIndex}:`, err);
        }
        await sleep(200);
      }
    }

    if (i + EMBED_BATCH < allChunks.length) {
      await sleep(BATCH_DELAY_MS);
    }

    console.log(`[Indexing] Embedded ${Math.min(i + EMBED_BATCH, allChunks.length)}/${allChunks.length} chunks`);
  }

  // Phase 3: Batch upsert to Pinecone
  if (vectors.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      await pineconeIndex.upsert(vectors.slice(i, i + batchSize));
    }
  }

  console.log("[Indexing] Completed. Total vectors indexed:", vectors.length);
  return vectors.length;
}

// ─── Exported: retrieveContext ──────────────────────────────────────────────

export async function retrieveContext(
  query: string,
  repoId: string,
  topK: number = 5
) {
  const queryEmbedding = await embeddings.embedQuery(query);

  const results = await pineconeIndex.query({
    vector: queryEmbedding,
    filter: { repoId },
    topK,
    includeMetadata: true,
  });

  return results.matches
    .map((match) => match.metadata?.content as string)
    .filter(Boolean);
}

// ─── Exported: updateCodebaseIndex (delta re-indexing on push) ──────────────

export async function updateCodebaseIndex(
  repoId: string,
  changedFiles: { path: string; content: string }[],
  removedPaths: string[]
) {
  // 1. Delete vectors for removed files
  if (removedPaths.length > 0) {
    for (const filePath of removedPaths) {
      try {
        await pineconeIndex.deleteMany({ repoId, path: filePath });
        console.log(`Deleted vectors for removed file: ${filePath}`);
      } catch (error) {
        console.error(`Failed to delete vectors for ${filePath}:`, error);
      }
    }
  }

  // 2. Delete old chunks for changed files, then re-index them
  if (changedFiles.length > 0) {
    for (const file of changedFiles) {
      try {
        await pineconeIndex.deleteMany({ repoId, path: file.path });
      } catch (error) {
        console.error(`Failed to delete old chunks for ${file.path}:`, error);
      }
    }

    // Chunk all changed files
    const allChunks: { text: string; path: string; chunkIndex: number }[] = [];
    for (const file of changedFiles) {
      if (!file) continue;
      const fullContent = `File: ${file.path}\n\n${file.content}`;
      const splitter = getSplitterForFile(file.path);
      const chunks = await splitter.splitText(fullContent);
      for (let ci = 0; ci < chunks.length; ci++) {
        allChunks.push({ text: chunks[ci]!, path: file.path, chunkIndex: ci });
      }
    }

    // Batch embed
    const vectors: {
      id: string;
      values: number[];
      metadata: { repoId: string; path: string; content: string; chunkIndex: number };
    }[] = [];

    const EMBED_BATCH = 100;
    for (let i = 0; i < allChunks.length; i += EMBED_BATCH) {
      const batch = allChunks.slice(i, i + EMBED_BATCH);
      const texts = batch.map((c) => c.text);

      try {
        const batchEmbeddings = await batchEmbed(texts);
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j]!;
          const safePathPart = chunk.path.replace(/\//g, "-");
          vectors.push({
            id: `${repoId}-${safePathPart}-chunk-${chunk.chunkIndex}`,
            values: batchEmbeddings[j]!,
            metadata: { repoId, path: chunk.path, content: chunk.text, chunkIndex: chunk.chunkIndex },
          });
        }
      } catch (error) {
        console.error(`Delta batch embed failed at ${i}:`, error);
        for (const chunk of batch) {
          try {
            const emb = await embeddings.embedQuery(chunk.text);
            const safePathPart = chunk.path.replace(/\//g, "-");
            vectors.push({
              id: `${repoId}-${safePathPart}-chunk-${chunk.chunkIndex}`,
              values: emb,
              metadata: { repoId, path: chunk.path, content: chunk.text, chunkIndex: chunk.chunkIndex },
            });
          } catch (err) {
            console.log(`Failed to embed ${chunk.path} chunk ${chunk.chunkIndex}:`, err);
          }
          await sleep(200);
        }
      }

      if (i + EMBED_BATCH < allChunks.length) {
        await sleep(BATCH_DELAY_MS);
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

// ─── Feature A: Documentation Generation (Multi-Query RAG) ──────────────────

const DOC_QUERIES: Record<string, string[]> = {
  readme: [
    "project overview and main purpose",
    "key features and capabilities",
    "installation and setup steps",
    "usage examples and getting started",
  ],
  architecture: [
    "data flow between modules and services",
    "key services and their responsibilities",
    "database models and relationships",
    "folder structure and project organization",
  ],
  onboarding: [
    "prerequisites and dependencies",
    "environment variables and configuration",
    "folder structure and key files",
    "coding conventions and naming patterns",
    "how to run tests and development workflow",
  ],
};

const DOC_PROMPTS: Record<string, string> = {
  readme: `You are a technical writer. Generate a comprehensive, well-structured README.md for this codebase. Include: project title and description, badges (placeholder), features list, prerequisites, installation steps, usage examples, project structure overview, contributing guide, and license section. Use Markdown formatting. Include at most one Mermaid architecture diagram in a fenced code block. Only output Mermaid code that is syntactically valid.`,
  architecture: `You are a software architect. Generate an architecture document for this codebase. Include: high-level system overview, component diagram (Mermaid), description of each major module/service and its responsibilities, data flow diagrams (Mermaid sequence diagrams), database schema overview, and key design decisions.

Mermaid requirements:
- Use fenced blocks with \`\`\`mermaid.
- Keep syntax simple and valid for Mermaid v11.
- Prefer graph TD/LR and sequenceDiagram with basic constructs only.
- Do not include malformed arrows, unmatched brackets, HTML, or markdown inside Mermaid blocks.
- If unsure, skip the Mermaid block instead of outputting invalid syntax.`,
  onboarding: `You are a senior developer writing an onboarding guide for new contributors. Generate a step-by-step onboarding document covering: prerequisites, cloning and setup, environment configuration (list every env var with description), running locally, project structure walkthrough (every important file/folder), coding conventions, how tests work, how to open a PR, and common gotchas. Make it friendly and thorough.`,
};

//  Generate a documentation markdown document for a repository using RAG context.
 //  Uses multi-query retrieval: fires several focused queries per doc type,
 //  deduplicates the results, then feeds combined context to Gemini.
 
export async function generateDocMarkdown(
  repoId: string,
  docType: string,
  repoFullName: string
): Promise<string> {
  const queries = DOC_QUERIES[docType] || DOC_QUERIES.readme;
  const systemPrompt = DOC_PROMPTS[docType] || DOC_PROMPTS.readme;

  // Retrieve context for each query and combine
  const contextChunks: string[] = [];
  if (queries) {
    for (const query of queries) {
      const results = await retrieveContext(query, repoId, 5);
      contextChunks.push(...results);
    }
  }

  // Deduplicate by content prefix
  const seen = new Set<string>();
  const uniqueChunks = contextChunks.filter((c) => {
    const key = c.slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const contextText = uniqueChunks.slice(0, 20).join("\n\n---\n\n");

  const { generateText } = await import("ai");
  const { google } = await import("@ai-sdk/google");

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: `Repository: ${repoFullName}\n\nCODEBASE CONTEXT:\n${contextText}\n\nGenerate the ${docType} document now. Be thorough and accurate based on the actual code context provided.`,
  });

  return text;
}

// ─── Exported: deleteRepoVectors ────────────────────────────────────────────

 //  Delete all vectors for a given repository.
 //  Used when disconnecting a repo to clean up Pinecone.

export async function deleteRepoVectors(repoId: string) {
  try {
    // Pinecone supports deleteMany with a metadata filter
    await pineconeIndex.deleteMany({ repoId });
    console.log(`Deleted all vectors for repo: ${repoId}`);
  } catch (error) {
    console.error(`Failed to delete vectors for repo ${repoId}:`, error);
  }
}
