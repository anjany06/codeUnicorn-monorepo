"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectRepository } from "@/lib/api";

type ConnectRepoInput = {
  owner: string;
  repo: string;
  githubId: number;
};

export const useConnectRepository = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ConnectRepoInput>({
    mutationFn: async ({ owner, repo, githubId }) => {
      const result = await connectRepository(owner, repo, githubId);
      if (!result.success) {
        throw new Error(result.error || "Failed to connect repository.");
      }
    },
    onSuccess: () => {
      toast.success("Repository connected. Indexing has started in the background.");
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["connected-repositories"],
      });
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to connect repository. Please try again."
      );
      console.error("Error connecting repository:", error);
    },
  });
};
