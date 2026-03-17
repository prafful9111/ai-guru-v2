import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CreateUserInput, UserResponse } from "@repo/validation";

interface CreateUserResponse {
  user: UserResponse;
  message: string;
}

interface UseCreateUserOptions {
  onSuccess?: (data: CreateUserResponse) => void;
  onError?: (error: ApiError) => void;
}

export function useCreateUser(options?: UseCreateUserOptions) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      setServerError(null);
      return apiClient.post<CreateUserResponse>("/api/admin/users", data);
    },
    onSuccess: (data) => {
      // Invalidate staff queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["staffRecords"] });
      options?.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      setServerError(error.message || "Failed to create user");
      options?.onError?.(error);
    },
  });

  const createUser = async (data: CreateUserInput) => {
    return mutation.mutateAsync(data);
  };

  const reset = () => {
    setServerError(null);
    mutation.reset();
  };

  return {
    createUser,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    serverError,
    reset,
    data: mutation.data,
  };
}
