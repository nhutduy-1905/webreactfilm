import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export const useMovie = (movieId?: string) => {
  const { data, error } = useSWR(movieId ? \/api/movies/\\ : null, fetcher);
  return { movie: data, isLoading: !error && !data, isError: error };
};
