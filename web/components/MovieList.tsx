import React, { useState } from "react";
import { useAppDispatch } from "../store/index";
import { movieActions, movieState } from "../store/movies";
import { useGetSingleMovie, MovieItem } from "../hooks/useMovieList";

interface MovieCardProps {
  data: MovieItem;
  onClick: (id: string) => void;
}

const FALLBACK_IMG = "/images/placeholder.png";

const MovieCard: React.FC<MovieCardProps> = ({ data, onClick }) => {
  // Xử lý image URL linh hoạt
  const initialSrc = React.useMemo(() => {
    const raw =
      data?.thumbnailUrl ||
      data?.thumbnail_url ||
      data?.posterUrl ||
      data?.image ||
      "";

    if (!raw) return FALLBACK_IMG;

    if (typeof raw === "string" && !raw.startsWith("http") && !raw.startsWith("/")) {
      return `/${raw}`;
    }

    return raw;
  }, [data]);

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  return (
    <button
      type="button"
      onClick={() => onClick(String(data?.id ?? data?._id ?? ""))}
      className="
        group relative w-full overflow-hidden rounded-lg
        aspect-[2/3] bg-zinc-900
        focus:outline-none focus:ring-2 focus:ring-white/60
        transition-transform duration-300 ease-out
        hover:scale-105 hover:z-10
      "
    >
      <img
        src={imgSrc}
        alt={data?.title || "Poster"}
        className="
          w-full h-full object-cover object-top
          transition-all duration-300
          group-hover:brightness-110
        "
        onError={() => setImgSrc(FALLBACK_IMG)}
        loading="lazy"
      />
      {/* Subtle overlay on hover for better visual feedback */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </button>
  );
};

interface MovieListProps {
  data: Record<string, any>[];
  title: string;
}

const MovieList: React.FC<MovieListProps> = ({ data, title }) => {
  const dispatch = useAppDispatch();
  const getSingleMovie = useGetSingleMovie();

  if (!data || data.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    if (!id) return;
    const movie = getSingleMovie(id);
    if (movie) {
      const movieStateData: movieState = {
        id: movie.id,
        title: movie.title || "",
        description: movie.description || "",
        videoUrl: movie.videoUrl || "",
        thumbnailUrl: movie.thumbnailUrl || "",
        genre: movie.genre || "",
        duration: movie.duration || 0,
        code: movie.code,
        slug: movie.slug,
        studio: movie.studio,
        director: movie.director,
        cast: movie.cast,
        status: movie.status,
        ageRating: movie.ageRating,
        releaseDate: movie.releaseDate,
        imageUrl: movie.imageUrl,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        trailerUrl: movie.trailerUrl,
        tags: movie.tags,
        subtitles: movie.subtitles,
        categories: movie.categories
      };
      dispatch(movieActions.showModal(movieStateData));
    }
  };

  return (
    <div className="px-4 md:px-12 mt-8 space-y-8">
      <div>
        <p className="text-white text-lg md:text-xl lg:text-2xl font-semibold mb-4 md:mb-6">
          {title}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
          {data.map((movie: any) => (
            <MovieCard key={movie.id || movie._id} data={movie} onClick={handleClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;
