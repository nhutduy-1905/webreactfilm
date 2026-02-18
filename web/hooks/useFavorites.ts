import { useMemo } from "react";
import useSWR from "swr";
import fetcher from "../libs/fetcher";
import type { MovieItem } from "./useMovieList";
import useCurrentUser from "./useCurrentUser";
import useMovieList from "./useMovieList";

const useFavorites = (enabled = true) => {
  const { data: currentUser } = useCurrentUser(enabled);
  const { data: movieList = [] } = useMovieList(enabled);

  const key = enabled ? "/api/favorites" : null;
  const { data, error, isLoading, mutate } = useSWR<MovieItem[]>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const fallbackFavorites = useMemo(() => {
    const favoriteIds = currentUser?.favoriteIds;
    const ids = Array.isArray(favoriteIds)
      ? favoriteIds.map((id) => String(id))
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
