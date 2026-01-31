"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectRepository } from "../actions";
import { toast } from "sonner";
import { github } from "better-auth";

export const useConnectRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }:{
      owner: string;
      repo: string;
      githubId: number;

    }) =>{
      return await connectRepository(owner, repo, githubId);
    },
    onSuccess: async () => {
      toast.success("Repository connected successfully!");
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Failed to connect repository. Please try again."
      );
      console.error("Error connecting repository:", error);
    }
  })
}