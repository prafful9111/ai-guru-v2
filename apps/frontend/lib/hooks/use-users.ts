import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import type { UserResponse } from "@repo/validation";

interface UsersResponse {
  users: UserResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UseUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 1, limit = 10, search = "" } = options;

  const query = useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      return apiClient.get<UsersResponse>(
        `/api/admin/users?${params.toString()}`,
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    users: query.data?.users || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as ApiError,
    refetch: query.refetch,
  };
}
