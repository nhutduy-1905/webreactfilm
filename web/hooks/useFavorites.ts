import { useMemo } from "react";
import useSWR from "swr";
import fetcher from "../libs/fetcher";
import type { MovieItem } from "./useMovieList";
import useCurrentUser from "./useCurrentUser";
import useMovieList from "./useMovieList";

const useFavorites = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: movieList = [] } = useMovieList();

  const { data, error, isLoading, mutate } = useSWR<MovieItem[]>("/api/favorites", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const fallbackFavorites = useMemo(() => {
    const ids = Array.isArray((currentUser as any)?.favoriteIds)
      ? (currentUser as any).favoriteIds.map((id: unknown) => String(id))
      : [];

    if (ids.length === 0 || movieList.length === 0) return [];

    const idSet = new Set(ids);
    return movieList.filter((movie) => idSet.has(String(movie.id ?? movie._id ?? "")));
  }, [currentUser, movieList]);

  const favorites = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) return data;
    return fallbackFavorites;
  }, [data, fallbackFavorites]);

  return { data: favorites, error, isLoading, mutate };
};

export default useFavorites;
