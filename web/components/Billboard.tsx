import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useAppSelector, useAppDispatch } from "../store/index";
import { movieActions, movieState } from "../store/movies";
import { useGetSingleMovie } from "../hooks/useMovieList";
import PlayButton from "./PlayButton";

const HERO_MEDIA_STYLE: React.CSSProperties = {
  objectFit: "cover",
  objectPosition: "50% 24%",
};

const WIDE_BANNER_MIN_RATIO = 1.45;

const resolveBannerSource = (movie?: Partial<movieState> | null): string => {
  if (!movie) return "/images/default-slate.png";
  return movie.backdropUrl || movie.thumbnailUrl || movie.imageUrl || "/images/default-slate.png";
};

const Billboard: React.FC = () => {
  const moviesList = useAppSelector((state) => state.movies.movies);
  const dispatch = useAppDispatch();
  const getMovie = useGetSingleMovie();

  const [mediaRatioByMovieId, setMediaRatioByMovieId] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    moviesList.forEach((movie) => {
      const movieId = String(movie?.id || "");
      if (!movieId || mediaRatioByMovieId[movieId] !== undefined) return;

      const src = resolveBannerSource(movie);
      if (!src) return;

      const probe = new Image();
      probe.onload = () => {
        if (cancelled) return;
        const ratio = probe.naturalWidth > 0 && probe.naturalHeight > 0
          ? probe.naturalWidth / probe.naturalHeight
          : 0;
        setMediaRatioByMovieId((prev) =>
          prev[movieId] !== undefined ? prev : { ...prev, [movieId]: ratio }
        );
      };
      probe.onerror = () => {
        if (cancelled) return;
        setMediaRatioByMovieId((prev) =>
          prev[movieId] !== undefined ? prev : { ...prev, [movieId]: 0 }
        );
      };
      probe.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [mediaRatioByMovieId, moviesList]);

  const bannerCandidates = useMemo(() => {
    if (!moviesList || moviesList.length === 0) return [];

    const wideMovies = moviesList.filter((movie) => {
      const movieId = String(movie?.id || "");
      const ratio = mediaRatioByMovieId[movieId];
      return typeof ratio === "number" && ratio >= WIDE_BANNER_MIN_RATIO;
    });

    return wideMovies.length > 0 ? wideMovies : moviesList;
  }, [mediaRatioByMovieId, moviesList]);

  const randomMovie = useMemo(() => {
    if (!bannerCandidates.length) return undefined;
    const idx = Math.floor(Math.random() * bannerCandidates.length);
    return bannerCandidates[idx];
  }, [bannerCandidates]);

  const mediaPoster = useMemo(() => {
    return resolveBannerSource(randomMovie);
  }, [randomMovie]);

  const directVideoUrl = useMemo(() => {
    const raw = String(randomMovie?.videoUrl ?? "").trim();
    return /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(raw) ? raw : "";
  }, [randomMovie?.videoUrl]);

  const activeMovieRatio = randomMovie ? mediaRatioByMovieId[String(randomMovie.id)] : undefined;
  const useContainForPoster = !directVideoUrl
    && typeof activeMovieRatio === "number"
    && activeMovieRatio > 0
    && activeMovieRatio < WIDE_BANNER_MIN_RATIO;

  const posterStyle = useMemo<React.CSSProperties>(() => {
    if (!useContainForPoster) return HERO_MEDIA_STYLE;
    return {
      objectFit: "contain",
      objectPosition: "center center",
    };
  }, [useContainForPoster]);

  const clickInfoHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    const movie = getMovie(id);
    if (!movie) return;

    const movieStateData: movieState[] = [{
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
      categories: movie.categories,
    }];
    dispatch(movieActions.showModal(movieStateData));
  };

  if (!randomMovie) return null;

  return (
    // Hero banner under fixed navbar
    <section className="relative">
      {/* Netflix-style hero banner with cinematic proportions */}
      <div className="relative w-full h-[56.25vw] min-h-[500px] max-h-[820px] overflow-hidden">
        {useContainForPoster && (
          <img
            src={mediaPoster}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 opacity-35"
          />
        )}

        {directVideoUrl ? (
          <video
            className="absolute inset-0 w-full h-full z-[1]"
            style={HERO_MEDIA_STYLE}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={mediaPoster}
            src={directVideoUrl}
          />
        ) : (
          <img
            src={mediaPoster}
            alt={randomMovie.title || "Poster"}
            className="absolute inset-0 w-full h-full z-[1]"
            style={posterStyle}
          />
        )}

        {/* Subtle top gradient for navbar blend */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />

        {/* Left gradient for text readability - clean and not too dark */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/40 to-transparent" />

        {/* Bottom gradient for smooth transition to content below */}
        <div className="absolute inset-x-0 bottom-0 h-56 md:h-72 bg-gradient-to-t from-black via-black/75 to-transparent" />

        {/* Content positioned in the lower third for cinematic feel */}
        <div className="absolute left-4 md:left-16 bottom-[25%] md:bottom-[30%] z-10 max-w-[90%] lg:max-w-[45%]">
          <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl leading-tight mb-3 md:mb-5">
            {randomMovie.title}
          </h1>

          <p className="text-white text-sm md:text-base lg:text-lg drop-shadow-xl line-clamp-3 md:line-clamp-4 leading-relaxed">
            {randomMovie.description}
          </p>

          <div className="flex items-center mt-5 md:mt-8 gap-3">
            <PlayButton movieId={randomMovie.id as string} />

            <button
              onClick={clickInfoHandler}
              data-id={randomMovie.id}
              className="
                bg-white/30 text-white backdrop-blur-sm
                rounded-md py-2 md:py-2.5 px-4 md:px-6
                text-sm lg:text-base font-semibold
                flex items-center gap-2
                hover:bg-white/40 transition-all duration-200
                shadow-lg
              "
            >
              <AiOutlineInfoCircle className="text-lg md:text-xl" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Billboard;
