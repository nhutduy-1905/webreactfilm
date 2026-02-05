import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export const useCurrentUser = () => {
  const { data, error } = useSWR('/api/current', fetcher);
  return { user: data, isLoading: !error && !data, isError: error };
};
