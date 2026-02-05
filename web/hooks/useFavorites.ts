import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export const useFavorites = (userId?: string) => {
  const { data, error } = useSWR(userId ? \/api/favorites\ : null, fetcher);
  return { favorites: data || [], isLoading: !error && !data, isError: error };
};
