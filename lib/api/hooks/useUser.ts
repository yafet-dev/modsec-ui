"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "../user";

// Get all users (super_admin only)
export function useAllUsers() {
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: () => userApi.getAll(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

