import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { useAppSelector, useAppDispatch } from "../store/index";
import { movieActions, movieState } from "../store/movies";
import { useGetSingleMovie } from "../hooks/useMovieList";
import PlayButton from "./PlayButton";

const HERO_MEDIA_STYLE: React.CSSProperties = {
  objectFit: "cover",
  objectPosition: "50% 24%",
};

const WIDE_BANNER_MIN_RATIO = 1.45;
const MIN_WIDE_BANNER_POOL = 8;
const HERO_UNMUTED_VOLUME = 70;
const parsedHeroRotateMs = Number(process.env.NEXT_PUBLIC_HERO_BANNER_ROTATE_MS);
const HERO_ROTATE_INTERVAL_MS = Number.isFinite(parsedHeroRotateMs)
  ? Math.max(8000, Math.floor(parsedHeroRotateMs))
  : 22000;
const HERO_ROTATION_POOL_SIZE = 5;
const ENABLE_YOUTUBE_HERO = (process.env.NEXT_PUBLIC_ENABLE_YOUTUBE_HERO ?? "1") === "1";
type PreferredBannerGroup = {
  key: string;
  keywords: readonly string[];
  preferredKeywords?: readonly string[];
  blockedKeywords?: readonly string[];
};

const PREFERRED_BANNER_GROUPS: readonly PreferredBannerGroup[] = [
  {
    key: "conan",
    keywords: ["conan", "detective conan", "tham tu lung danh conan"],
  },
  {
    key: "jujutsu-kaisen",
    keywords: ["jujutsu kaisen", "chu thuat hoi chien", "jujutsu"],
  },
  {
    key: "kung-fu-panda",
    keywords: ["kung fu panda", "panda"],
  },
  {
    key: "demon-slayer",
    keywords: ["demon slayer", "thanh guom diet quy", "kimetsu no yaiba"],
    preferredKeywords: ["vo han thanh", "infinity castle"],
    blockedKeywords: ["chuyen tau vo tan", "mugen train", "mugen"],
  },
  {
    key: "doctor-slump",
    keywords: ["doctor slump", "bac si slump"],
  },
];

const resolveBannerSource = (movie?: Partial<movieState> | null): string => {
  if (!movie) return "/images/default-slate.png";
  return movie.backdropUrl || movie.thumbnailUrl || movie.imageUrl || "/images/default-slate.png";
};

const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i;

function toYoutubeHeroEmbed(raw?: string): string {
  if (!raw) return "";

  try {
    const url = new URL(raw.trim());

    const buildEmbed = (id: string) => {
      const embed = new URL(`https://www.youtube.com/embed/${id}`);
      embed.searchParams.set("autoplay", "1");
      embed.searchParams.set("mute", "1");
      embed.searchParams.set("controls", "0");
      embed.searchParams.set("playsinline", "1");
      embed.searchParams.set("rel", "0");
      embed.searchParams.set("modestbranding", "1");
      embed.searchParams.set("iv_load_policy", "3");
      embed.searchParams.set("loop", "1");
      embed.searchParams.set("playlist", id);
      embed.searchParams.set("disablekb", "1");
      embed.searchParams.set("fs", "0");
      embed.searchParams.set("showinfo", "0");
      embed.searchParams.set("cc_load_policy", "0");
      embed.searchParams.set("hl", "vi");
      embed.searchParams.set("enablejsapi", "1");
      if (typeof window !== "undefined") {
        embed.searchParams.set("origin", window.location.origin);
      }
      return embed.toString();
    };

    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return buildEmbed(id);

      if (url.pathname.startsWith("/shorts/")) {
        const shortId = url.pathname.split("/")[2];
        if (shortId) return buildEmbed(shortId);
      }

      if (url.pathname.startsWith("/embed/")) {
        const embedId = url.pathname.split("/")[2];
        if (embedId) return buildEmbed(embedId);
      }
    }

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      if (id) return buildEmbed(id);
    }

    return "";
  } catch {
    return "";
  }
}

function hasMotionHeroMedia(movie?: Partial<movieState> | null): boolean {
  if (!movie) return false;

  const trailerRaw = String(movie.trailerUrl ?? "").trim();
  if (DIRECT_VIDEO_PATTERN.test(trailerRaw)) return true;
  if (ENABLE_YOUTUBE_HERO && toYoutubeHeroEmbed(trailerRaw)) return true;

  const videoRaw = String(movie.videoUrl ?? "").trim();
  if (DIRECT_VIDEO_PATTERN.test(videoRaw)) return true;
  return ENABLE_YOUTUBE_HERO && Boolean(toYoutubeHeroEmbed(videoRaw));
}

function normalizeText(value?: string): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0111\u0110]/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBannerSearchText(movie?: Partial<movieState> | null): string {
  if (!movie) return "";

  return normalizeText([
    movie.title,
    movie.slug,
    movie.code,
  ].filter(Boolean).join(" "));
}

function movieMatchesAnyKeyword(
  movie: Partial<movieState> | null | undefined,
  keywords: readonly string[] | undefined
): boolean {
  if (!keywords || keywords.length === 0) return false;
  if (!movie) return false;
  const searchText = getBannerSearchText(movie);
  if (!searchText) return false;

  return keywords.some((keyword) => searchText.includes(normalizeText(keyword)));
}

function movieHasAnyKeyword(
  movie: Partial<movieState> | null | undefined,
  keywords: readonly string[] | undefined
): boolean {
  return movieMatchesAnyKeyword(movie, keywords);
}

function hasRenderableBannerMedia(movie?: Partial<movieState> | null): boolean {
  if (!movie) return false;

  if (hasMotionHeroMedia(movie)) return true;

  const imageSrc = resolveBannerSource(movie);
  return Boolean(imageSrc && imageSrc !== "/images/default-slate.png");
}

function buildPreferredBannerPool(movies: movieState[]): movieState[] {
  const selected: movieState[] = [];
  const seenMovieIds = new Set<string>();

  for (const group of PREFERRED_BANNER_GROUPS) {
    const groupCandidates = movies.filter((movie) => (
      movieMatchesAnyKeyword(movie, group.keywords)
      && !movieHasAnyKeyword(movie, group.blockedKeywords)
      && hasRenderableBannerMedia(movie)
    ));
    if (!groupCandidates.length) continue;

    const preferredCandidates = groupCandidates.filter((movie) => (
      movieMatchesAnyKeyword(movie, group.preferredKeywords)
    ));
    const sourcePool = preferredCandidates.length ? preferredCandidates : groupCandidates;
    const motionCandidates = sourcePool.filter((movie) => hasMotionHeroMedia(movie));
    const pickedMovie = (motionCandidates.length ? motionCandidates : sourcePool)[0];
    const movieId = String(pickedMovie?.id || "");

    if (!movieId || seenMovieIds.has(movieId)) continue;
    seenMovieIds.add(movieId);
    selected.push(pickedMovie);
  }

  return selected;
}

const Billboard: React.FC = () => {
  const moviesList = useAppSelector((state) => state.movies.movies);
  const dispatch = useAppDispatch();
  const getMovie = useGetSingleMovie();

  const [mediaRatioByMovieId, setMediaRatioByMovieId] = useState<Record<string, number>>({});
  const [heroIndexSeed, setHeroIndexSeed] = useState(() => Math.floor(Math.random() * 1000));
  const [heroMuted, setHeroMuted] = useState(true);
  const directHeroRef = useRef<HTMLVideoElement | null>(null);
  const youtubeHeroRef = useRef<HTMLIFrameElement | null>(null);

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

    // If wide-banner pool is too small, fallback to full list to avoid repeating only a few titles.
    return wideMovies.length >= Math.min(MIN_WIDE_BANNER_POOL, moviesList.length)
      ? wideMovies
      : moviesList;
  }, [mediaRatioByMovieId, moviesList]);

  const rotationPool = useMemo(() => {
    // Preferred groups should be resolved from full movie list so portrait posters
    // (e.g., Doctor Slump) are not dropped by wide-ratio filtering.
    const preferredBannerPool = buildPreferredBannerPool(moviesList);
    if (preferredBannerPool.length >= HERO_ROTATION_POOL_SIZE) {
      return preferredBannerPool.slice(0, HERO_ROTATION_POOL_SIZE);
    }

    const selectedMovieIds = new Set(
      preferredBannerPool.map((movie) => String(movie?.id || ""))
    );

    const fillerCandidates = bannerCandidates.filter((movie) => {
      const movieId = String(movie?.id || "");
      if (!movieId || selectedMovieIds.has(movieId)) return false;
      return hasRenderableBannerMedia(movie);
    });

    return [...preferredBannerPool, ...fillerCandidates].slice(0, HERO_ROTATION_POOL_SIZE);
  }, [bannerCandidates, moviesList]);

  const rotationPoolSize = rotationPool.length;

  useEffect(() => {
    if (rotationPoolSize <= 1) return;

    const timer = window.setInterval(() => {
      setHeroIndexSeed((prev) => prev + 1);
    }, HERO_ROTATE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [rotationPoolSize]);

  const randomMovie = useMemo(() => {
    if (!rotationPool.length) return undefined;

    const preferredIndex = heroIndexSeed % rotationPool.length;
    return rotationPool[preferredIndex];
  }, [heroIndexSeed, rotationPool]);

  const mediaPoster = useMemo(() => {
    return resolveBannerSource(randomMovie);
  }, [randomMovie]);

  const directVideoUrl = useMemo(() => {
    const trailerRaw = String(randomMovie?.trailerUrl ?? "").trim();
    if (DIRECT_VIDEO_PATTERN.test(trailerRaw)) return trailerRaw;

    const videoRaw = String(randomMovie?.videoUrl ?? "").trim();
    return DIRECT_VIDEO_PATTERN.test(videoRaw) ? videoRaw : "";
  }, [randomMovie?.trailerUrl, randomMovie?.videoUrl]);

  const youtubeHeroUrl = useMemo(() => {
    if (!ENABLE_YOUTUBE_HERO) return "";
    const trailerEmbed = toYoutubeHeroEmbed(randomMovie?.trailerUrl);
    if (trailerEmbed) return trailerEmbed;
    return toYoutubeHeroEmbed(randomMovie?.videoUrl);
  }, [randomMovie?.trailerUrl, randomMovie?.videoUrl]);
  const canToggleHeroAudio = Boolean(directVideoUrl || youtubeHeroUrl);

  useEffect(() => {
    setHeroMuted(true);
  }, [randomMovie?.id]);

  const sendYoutubeHeroCommand = useCallback((func: string, args: unknown[] = []) => {
    const frame = youtubeHeroRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }, []);

  const applyYoutubeHeroAudioState = useCallback(() => {
    if (!youtubeHeroUrl) return;
    sendYoutubeHeroCommand(heroMuted ? "mute" : "unMute");
    if (!heroMuted) {
      sendYoutubeHeroCommand("setVolume", [HERO_UNMUTED_VOLUME]);
    }
  }, [heroMuted, sendYoutubeHeroCommand, youtubeHeroUrl]);

  const handleYoutubeHeroLoad = useCallback(() => {
    window.setTimeout(() => {
      applyYoutubeHeroAudioState();
    }, 120);
  }, [applyYoutubeHeroAudioState]);

  useEffect(() => {
    const player = directHeroRef.current;
    if (!player) return;
    player.muted = heroMuted;
    player.volume = heroMuted ? 0 : 1;
  }, [heroMuted, directVideoUrl]);

  useEffect(() => {
    applyYoutubeHeroAudioState();
  }, [applyYoutubeHeroAudioState]);

  const toggleHeroMute = useCallback(() => {
    if (!canToggleHeroAudio) return;
    setHeroMuted((prev) => !prev);
  }, [canToggleHeroAudio]);

  const activeMovieRatio = randomMovie ? mediaRatioByMovieId[String(randomMovie.id)] : undefined;
  const useContainForPoster = !directVideoUrl
    && !youtubeHeroUrl
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
    <section className="relative">
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
            ref={directHeroRef}
            className="absolute inset-0 w-full h-full z-[1]"
            style={HERO_MEDIA_STYLE}
            autoPlay
            muted={heroMuted}
            loop
            playsInline
            preload="metadata"
            poster={mediaPoster}
            src={directVideoUrl}
          />
        ) : youtubeHeroUrl ? (
          <div className="absolute inset-0 w-full h-full z-[1] overflow-hidden">
            <iframe
              ref={youtubeHeroRef}
              className="absolute -top-[11%] -left-[8%] h-[122%] w-[116%]"
              src={youtubeHeroUrl}
              title={randomMovie.title || "Hero trailer"}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={handleYoutubeHeroLoad}
            />
          </div>
        ) : (
          <img
            src={mediaPoster}
            alt={randomMovie.title || "Poster"}
            className="absolute inset-0 w-full h-full z-[1]"
            style={posterStyle}
          />
        )}

        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-[68px] md:top-[76px] bottom-0 bg-gradient-to-r from-black/78 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 md:h-72 bg-gradient-to-t from-black via-black/75 to-transparent" />
        {canToggleHeroAudio ? (
          <button
            type="button"
            onClick={toggleHeroMute}
            className="absolute right-4 md:right-8 bottom-[30%] z-20 h-14 w-14 rounded-full bg-black/70 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/85 transition-all duration-200"
            aria-label={heroMuted ? "Bat am thanh banner" : "Tat am thanh banner"}
            title={heroMuted ? "Bat am thanh banner" : "Tat am thanh banner"}
          >
            {heroMuted ? <IoVolumeMuteOutline size={24} /> : <IoVolumeHighOutline size={24} />}
          </button>
        ) : null}

        <div className="absolute left-4 md:left-16 bottom-[25%] md:bottom-[30%] z-10 max-w-[90%] lg:max-w-[45%]">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs md:text-sm text-white/85">
            {randomMovie.genre && (
              <span className="rounded bg-white/15 px-2 py-1">
                {randomMovie.genre}
              </span>
            )}
            {randomMovie.duration ? <span>{randomMovie.duration} phut</span> : null}
          </div>

          <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl leading-tight mb-3 md:mb-5">
            {randomMovie.title}
          </h1>

          <p className="text-white text-sm md:text-base lg:text-lg drop-shadow-xl line-clamp-3 md:line-clamp-4 leading-relaxed mb-2 md:mb-3">
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


