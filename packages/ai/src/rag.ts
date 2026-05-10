/**
 * RAG (Retrieval-Augmented Generation) pipeline — powered by LangChain.
 *
 * Uses:
 *  - LangChain RecursiveCharacterTextSplitter for language-aware code chunking
 *  - Custom LangChain Embeddings wrapper (Vercel AI SDK + Gemini) for 768-dim vectors
 *  - Pinecone for vector storage and retrieval
 *  - Vercel AI SDK for text generation (doc generation)
 */

import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { pineconeIndex } from "./pinecone";

// Custom LangChain Embeddings (wraps Vercel AI SDK for exact 768-dim compat) 

const RATE_LIMIT_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class GeminiEmbeddings extends Embeddings {
  private lastCallTime = 0;

  constructor(params?: EmbeddingsParams) {
    super({ maxRetries: 5, ...(params ?? {}) });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embedQuery(text));
      // Rate-limit between calls for Gemini free tier
      await sleep(RATE_LIMIT_DELAY_MS);
    }
    return results;
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

// Language-Aware Text Splitters 

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

//  Exported: generateEmbedding (kept for backward compat)

export async function generateEmbedding(text: string): Promise<number[]> {
  return embeddings.embedQuery(text);
}

//  Exported: indexCodebase 
export async function indexCodebase(
  repoId: string,
  files: { path: string; content: string }[]
) {
  const vectors: {
    id: string;
    values: number[];
    metadata: { repoId: string; path: string; content: string; chunkIndex: number };
  }[] = [];

  for (const file of files) {
    if (!file) continue;

    const fullContent = `File: ${file.path}\n\n${file.content}`;
    const splitter = getSplitterForFile(file.path);
    const chunks = await splitter.splitText(fullContent);

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunkText = chunks[ci]!;
      try {
        const embedding = await embeddings.embedQuery(chunkText);
        const safePathPart = file.path.replace(/\//g, "-");
        vectors.push({
          id: `${repoId}-${safePathPart}-chunk-${ci}`,
          values: embedding,
          metadata: {
            repoId,
            path: file.path,
            content: chunkText,
            chunkIndex: ci,
          },
        });
      } catch (error) {
        console.log(`Failed to embed ${file.path} chunk ${ci}:`, error);
      }

      // Rate-limit between embedding calls
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  // Batch upsert to Pinecone
  if (vectors.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      await pineconeIndex.upsert(vectors.slice(i, i + batchSize));
    }
  }

  console.log("Indexing completed. Total vectors indexed:", vectors.length);
  return vectors.length;
}

//  Exported: retrieveContext
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

//  Exported: updateCodebaseIndex (delta re-indexing on push)
export async function updateCodebaseIndex(
  repoId: string,
  changedFiles: { path: string; content: string }[],
  removedPaths: string[]
) {
  // 1. Delete vectors for removed files (metadata filter)
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
    // Delete existing chunks for all changed files first
    for (const file of changedFiles) {
      try {
        await pineconeIndex.deleteMany({ repoId, path: file.path });
      } catch (error) {
        console.error(`Failed to delete old chunks for ${file.path}:`, error);
      }
    }

    // Now re-index changed files with language-aware chunking
    const vectors: {
      id: string;
      values: number[];
      metadata: { repoId: string; path: string; content: string; chunkIndex: number };
    }[] = [];

    for (const file of changedFiles) {
      if (!file) continue;

      const fullContent = `File: ${file.path}\n\n${file.content}`;
      const splitter = getSplitterForFile(file.path);
      const chunks = await splitter.splitText(fullContent);

      for (let ci = 0; ci < chunks.length; ci++) {
        const chunkText = chunks[ci]!;
        try {
          const embedding = await embeddings.embedQuery(chunkText);
          const safePathPart = file.path.replace(/\//g, "-");
          vectors.push({
            id: `${repoId}-${safePathPart}-chunk-${ci}`,
            values: embedding,
            metadata: {
              repoId,
              path: file.path,
              content: chunkText,
              chunkIndex: ci,
            },
          });
        } catch (error) {
          console.log(`Failed to embed ${file.path} chunk ${ci}:`, error);
        }

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

//  Feature A: Documentation Generation (Multi-Query RAG)

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

//  Exported: deleteRepoVectors

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
