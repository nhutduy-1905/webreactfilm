import useSwr from 'swr'
import { useAppSelector} from "../store/index";
import {movieState} from "../store/movies" 

import fetcher from '../libs/fetcher';

const useMovieList = () => {
  const { data, error, isLoading} = useSwr('/api/movies?status=published&limit=50', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  // Backend returns { data: [...], pagination: {...} }
  const movies = data?.data || data || [];

  return {
    data: movies,
    error,
    isLoading,
  }
};

export function useGetMovie(){
  const movies = useAppSelector(state => state.movies.movies)

  return (id: string) => {
    const movie = movies.filter(movie => movie.id === id)
    return movie;
  }
}

export default useMovieList;
