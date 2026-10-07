import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 min before data is considered stale
        gcTime: 10 * 60 * 1000,         // 10 min garbage collection
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
