

import {embed} from "ai";
import {createGoogleGenerativeAI, google}from "@ai-sdk/google";
import { pineconeIndex } from "./pinecone";



export async function generateEmbedding(text: string) {
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
}

export async function indexCodebase(repoId:string, files:{path:string, content:string}[]){
  const vectors = [];

  for(const file of files){
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