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
      await connectRepository(owner, repo, githubId);
    },
    onSuccess: () => {
      toast.success("Repository connected successfully!");
      queryClient.invalidateQueries({
        queryKey: ["repositories"],
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
