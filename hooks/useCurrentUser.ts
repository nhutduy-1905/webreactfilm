<<<<<<< HEAD
import useSwr from 'swr'

import fetcher from '../libs/fetcher';

const useCurrentUser = () => {
  const { data, error, isLoading, mutate } = useSwr('/api/current', fetcher);
  return {
    data,
    error,
    isLoading,
    mutate,
  }
=======
import useSWR from "swr";
import fetcher from "../libs/fetcher";

const useCurrentUser = () => {
  const { data, error, isLoading, mutate } = useSWR("/api/current", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return { data, error, isLoading, mutate };
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
};

export default useCurrentUser;
