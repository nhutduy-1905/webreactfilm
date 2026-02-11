import useSwr from 'swr'

import fetcher from '../libs/fetcher';

const useCurrentUser = () => {
  const { data, error, isLoading, mutate } = useSwr('/api/current', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });
  return {
    data,
    error,
    isLoading,
    mutate,
  }
};

export default useCurrentUser;
