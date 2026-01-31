// import { prisma } from "@codeunicorn/database";
// import { inngest } from "../client";
// import { getRepoFileContents } from "@/module/github/lib/github";
// import { indexCodebase } from "@/module/ai/lib/rag";


// export const indexRepo = inngest.createFunction(
//   {id: "index-the-repository"},
//   {event: "repository.connected"},

//   async ({event, step})=>{
//     const {owner, repo, userId} = event.data;

//     //STEP 1 : fetch all the files from the repository
//     const files = await step.run("fetch-all-the-files", async()=> {

//       const account = await prisma.account.findFirst({
//         where:{
//           userId: userId,
//           providerId: "github"
//         }
//       })
//       if(!account?.accessToken){
//         throw new Error("No Github access token found")
//       }

//       return await getRepoFileContents(account.accessToken, owner, repo);
//     })

//     await step.run("index-the-codebase", async()=>{
//      await indexCodebase(`${owner}/${repo}`, files);
//     })

//     return {success:true, indexedFiles: files.length};
//   }
// )