import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export const useMovieList = () => {
  const { data, error } = useSWR('/api/movies', fetcher);
  return { movies: data || [], isLoading: !error && !data, isError: error };
};
