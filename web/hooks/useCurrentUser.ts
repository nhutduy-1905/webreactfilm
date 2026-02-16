import { useMemo } from "react";
import useSwr from "swr";

import fetcher from "../libs/fetcher";

const useCurrentUser = () => {
  const { data, error, isLoading, mutate } = useSwr("/api/current", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const normalizedUser = useMemo(() => {
    if (!data) return null;
    return (data as any).currentUser ?? data;
  }, [data]);

  return {
    data: normalizedUser,
    error,
    isLoading,
    mutate,
  };
};

export default useCurrentUser;
