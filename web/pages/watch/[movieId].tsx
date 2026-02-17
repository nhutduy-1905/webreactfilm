import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AiFillStar, AiOutlineArrowLeft, AiOutlineClose, AiOutlineHeart, AiOutlineStar } from "react-icons/ai";
import { BiCommentDetail, BiRedo, BiShareAlt, BiUndo } from "react-icons/bi";
import { BsBell, BsChevronDown, BsInstagram, BsLink45Deg, BsPauseFill, BsPlayFill, BsSearch, BsWhatsapp } from "react-icons/bs";
import { SiFacebook, SiGmail, SiX, SiZalo } from "react-icons/si";
import { IoSettingsOutline, IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { MdClosedCaption } from "react-icons/md";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import useMovie from "../../hooks/useMovie";
import useCurrentUser from "../../hooks/useCurrentUser";
import AccountMenu from "../../components/AccountMenu";
import CommentSection from "../../components/CommentSection";
import IntroN from "../../components/IntroN";

type RatingApiResponse = {
  movieId: string;
  averageRating: number;
  ratingCount: number;
  userRating: number | null;
};

type FavoriteCountApiResponse = {
  movieId: string;
  favoriteCount: number;
};

const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i;
const parsedIntroSkipSeconds = Number(process.env.NEXT_PUBLIC_INTRO_SKIP_SECONDS);
const INTRO_SKIP_SECONDS = Number.isFinite(parsedIntroSkipSeconds)
  ? Math.max(0, Math.floor(parsedIntroSkipSeconds))
  : 0;
const BRAND_INTRO_URL =
  process.env.NEXT_PUBLIC_BRAND_INTRO_URL || "https://youtu.be/GV3HUDMQ-F8?si=gQQSweVWrmLqX2Vd";
const parsedBrandIntroDurationMs = Number(
  process.env.NEXT_PUBLIC_BRAND_INTRO_DURATION_MS ?? process.env.NEXT_PUBLIC_INTRO_DURATION_MS
);
const INTRO_DURATION_MS = Number.isFinite(parsedBrandIntroDurationMs)
  ? Math.max(0, Math.floor(parsedBrandIntroDurationMs))
  : 4000;
const WATCH_LOCK_PLAYER_CONTROLS = (
  process.env.NEXT_PUBLIC_WATCH_LOCK_PLAYER_CONTROLS
  ?? "0"
) === "1";
const ALLOW_YOUTUBE_WATCH_EMBED = (
  process.env.NEXT_PUBLIC_ALLOW_YOUTUBE_WATCH_EMBED
  ?? "1"
) === "1";
type YoutubePlaybackQuality = "auto" | "hd1080" | "hd720" | "large" | "medium" | "small" | "tiny";

const YOUTUBE_QUALITY_OPTIONS: Array<{ value: YoutubePlaybackQuality; label: string }> = [
  { value: "auto", label: "Tự động" },
  { value: "hd1080", label: "1080p" },
  { value: "hd720", label: "720p" },
  { value: "large", label: "480p" },
  { value: "medium", label: "360p" },
  { value: "small", label: "240p" },
  { value: "tiny", label: "144p" },
];

function pickFirstNonEmptyString(input: unknown, keys: readonly string[]): string {
  if (!input || typeof input !== "object") return "";
  const record = input as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function pickFirstFiniteNumber(input: unknown, keys: readonly string[]): number | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.trim().replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
  }

  return null;
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "00:00";
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeYoutubeQuality(value: unknown): YoutubePlaybackQuality | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "default" || normalized === "auto") return "auto";
  if (normalized === "highres") return "hd1080";
  if (
    normalized === "hd1080"
    || normalized === "hd720"
    || normalized === "large"
    || normalized === "medium"
    || normalized === "small"
    || normalized === "tiny"
  ) {
    return normalized;
  }
  return null;
}

function formatRatingCountLabel(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "Chưa có đánh giá";
  const normalized = Math.max(0, Math.floor(count));
  const formatted = new Intl.NumberFormat("vi-VN").format(normalized);
  return `${formatted} lượt đánh giá`;
}

function applyYoutubePlayerParams(url: URL) {
  // Keep YouTube embed params minimal for compatibility.
  // Autoplay after Intro; mute first to satisfy browser autoplay policy.
  url.searchParams.set("autoplay", "1");
  url.searchParams.set("mute", "0");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");
  url.searchParams.set("enablejsapi", "1");
  // Hide native YouTube controls to keep the custom watch UI consistent.
  url.searchParams.set("controls", "0");
  url.searchParams.set("disablekb", "1");
  url.searchParams.set("fs", "0");
  url.searchParams.set("modestbranding", "1");
  url.searchParams.set("iv_load_policy", "3");
  if (typeof window !== "undefined") {
    url.searchParams.set("origin", window.location.origin);
  }
}

function toYoutubeEmbed(raw: string): string {
  try {
    const u = new URL(raw.trim());
    const buildEmbed = (id: string) => {
      const embed = new URL(`https://www.youtube.com/embed/${id}`);
      applyYoutubePlayerParams(embed);
      return embed.toString();
    };

    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return buildEmbed(id);

      if (u.pathname.startsWith("/shorts/")) {
        const shortId = u.pathname.split("/")[2];
        if (shortId) return buildEmbed(shortId);
      }

      if (u.pathname.startsWith("/embed/")) {
        const embedId = u.pathname.split("/")[2];
        if (embedId) return buildEmbed(embedId);
      }
    }

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return buildEmbed(id);
    }

    return "";
  } catch {
    return "";
  }
}

function isYoutubeUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return (
      u.hostname.includes("youtube.com")
      || u.hostname.includes("youtube-nocookie.com")
      || u.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

function isLikelyDirectVideoUrl(raw: string): boolean {
  const value = String(raw || "").trim();
  if (!value) return false;
  if (DIRECT_VIDEO_PATTERN.test(value)) return true;
  if (isYoutubeUrl(value)) return false;
  // Accept HTTP(S) URLs without extension (many CDN signed URLs are like this).
  return /^https?:\/\//i.test(value);
}

function withYoutubeStart(embedUrl: string, startSeconds: number): string {
  if (!embedUrl || startSeconds <= 0) return embedUrl;

  try {
    const parsed = new URL(embedUrl);
    const isYoutubeEmbed = (
      parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtube-nocookie.com")
    ) && parsed.pathname.includes("/embed/");
    if (!isYoutubeEmbed) return embedUrl;

    if (!parsed.searchParams.has("start")) {
      parsed.searchParams.set("start", String(startSeconds));
    }

    return parsed.toString();
  } catch {
    return embedUrl;
  }
}

const WatchPage = () => {
  const router = useRouter();
  const { movieId, mode } = router.query as { movieId?: string; mode?: string };

  const [completedIntroKey, setCompletedIntroKey] = useState("");
  const [headerMode, setHeaderMode] = useState<"brand" | "title">("brand");
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [playerIsPlaying, setPlayerIsPlaying] = useState(true);
  const [playerIsMuted, setPlayerIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playbackQuality, setPlaybackQuality] = useState<YoutubePlaybackQuality>("auto");
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteSubmitting, setFavoriteSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerVolume, setPlayerVolume] = useState(1);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareAtCurrentTime, setShareAtCurrentTime] = useState(false);

  const lastPlaybackTimeRef = useRef(0);
  const youtubeFrameRef = useRef<HTMLIFrameElement | null>(null);
  const directVideoRef = useRef<HTMLVideoElement | null>(null);
  const commentAnchorRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPlayerSyncAtRef = useRef(0);
  const trackedViewKeyRef = useRef("");

  const validMovieId = movieId && movieId.trim() !== "" ? movieId : null;
  const { data: currentUser, mutate: mutateCurrentUser } = useCurrentUser();
  const { data: movie, isLoading } = useMovie(validMovieId || "");
  const isTrailerMode = mode === "trailer";

  const movieUrl = useMemo(() => pickFirstNonEmptyString(movie, ["videoUrl", "movieUrl", "video_url"]), [movie]);
  const trailerUrl = useMemo(() => pickFirstNonEmptyString(movie, ["trailerUrl", "trailer_url"]), [movie]);
  const chosenUrl = isTrailerMode ? trailerUrl : movieUrl;

  const introKey = useMemo(() => {
    if (!validMovieId || !chosenUrl || INTRO_DURATION_MS <= 0) return "";
    return `${validMovieId}:${mode || "movie"}:${chosenUrl}`;
  }, [validMovieId, chosenUrl, mode]);

  const showPlaybackIntro = Boolean(introKey) && completedIntroKey !== introKey;
  const playbackSourceUrl = showPlaybackIntro ? "" : chosenUrl;

  const isDirectVideo = useMemo(() => isLikelyDirectVideoUrl(playbackSourceUrl), [playbackSourceUrl]);
  const trailerEmbedUrl = useMemo(() => {
    if (!playbackSourceUrl || !ALLOW_YOUTUBE_WATCH_EMBED) return "";
    return toYoutubeEmbed(playbackSourceUrl);
  }, [playbackSourceUrl]);
  const fallbackDurationSeconds = useMemo(() => {
    const rawDuration = pickFirstFiniteNumber(movie, ["duration", "runtime", "movieDuration"]);
    if (!rawDuration || rawDuration <= 0) return 0;

    if (isTrailerMode) {
      // Trailer data can come as seconds from legacy sources.
      return rawDuration <= 30 ? rawDuration * 60 : rawDuration;
    }

    // Admin duration field is minutes for full movies.
    return rawDuration <= 600 ? rawDuration * 60 : rawDuration;
  }, [isTrailerMode, movie]);
  const playbackEmbedUrl = useMemo(() => trailerEmbedUrl, [trailerEmbedUrl]);
  const isYouTubeSource = useMemo(() => isYoutubeUrl(playbackSourceUrl), [playbackSourceUrl]);
  const isPlayableSurface = Boolean(playbackSourceUrl) && (isDirectVideo || Boolean(playbackEmbedUrl));

  const rawViewCount = useMemo(() => {
    return pickFirstFiniteNumber(movie, ["viewCount", "views", "view_count"]);
  }, [movie]);
  const displayedViewCount = rawViewCount && rawViewCount > 0 ? rawViewCount : 0;
  const formattedViewCount = useMemo(
    () => new Intl.NumberFormat("vi-VN").format(Math.floor(displayedViewCount)),
    [displayedViewCount]
  );
  const isFavorite = useMemo(() => {
    if (!validMovieId) return false;
    const favoriteIds = currentUser?.favoriteIds;
    const ids = Array.isArray(favoriteIds) ? favoriteIds : [];
    return ids.includes(validMovieId);
  }, [currentUser?.favoriteIds, validMovieId]);
  const progressPercent = useMemo(() => {
    if (!Number.isFinite(playerDuration) || playerDuration <= 0) return 0;
    const percent = (playerCurrentTime / playerDuration) * 100;
    return Math.max(0, Math.min(100, percent));
  }, [playerCurrentTime, playerDuration]);
  const progressTrackStyle = useMemo<React.CSSProperties>(() => ({
    background: `linear-gradient(to right, #e50914 0%, #e50914 ${progressPercent}%, rgba(255,255,255,0.26) ${progressPercent}%, rgba(255,255,255,0.26) 100%)`,
  }), [progressPercent]);
  const volumePercent = useMemo(
    () => Math.max(0, Math.min(100, (playerIsMuted ? 0 : playerVolume) * 100)),
    [playerIsMuted, playerVolume]
  );
  const volumeTrackStyle = useMemo<React.CSSProperties>(() => ({
    background: `linear-gradient(to right, #e50914 0%, #e50914 ${volumePercent}%, rgba(255,255,255,0.28) ${volumePercent}%, rgba(255,255,255,0.28) 100%)`,
  }), [volumePercent]);
  const favoriteCountLabel = useMemo(
    () => new Intl.NumberFormat("vi-VN").format(Math.max(0, favoriteCount)),
    [favoriteCount]
  );
  const ratingCountLabel = useMemo(
    () => formatRatingCountLabel(ratingCount),
    [ratingCount]
  );
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const safePath = router.asPath || (validMovieId ? `/watch/${validMovieId}` : "/watch");
    return `${window.location.origin}${safePath}`;
  }, [router.asPath, validMovieId]);
  const shareTitle = useMemo(
    () => String(movie?.title || "Nextflix"),
    [movie?.title]
  );
  const shareStartSeconds = useMemo(
    () => Math.max(0, Math.floor(playerCurrentTime || 0)),
    [playerCurrentTime]
  );
  const effectiveShareUrl = useMemo(() => {
    if (!shareUrl) return "";
    if (!shareAtCurrentTime || shareStartSeconds <= 0) return shareUrl;

    try {
      const parsed = new URL(shareUrl);
      parsed.searchParams.set("t", String(shareStartSeconds));
      return parsed.toString();
    } catch {
      return shareUrl;
    }
  }, [shareAtCurrentTime, shareStartSeconds, shareUrl]);

  const sendYoutubeCommand = useCallback((func: string, args: unknown[] = []) => {
    const iframe = youtubeFrameRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }, []);

  const requestYoutubeSnapshot = useCallback(() => {
    if (!playbackEmbedUrl || isDirectVideo) return;
    sendYoutubeCommand("getCurrentTime");
    sendYoutubeCommand("getDuration");
    sendYoutubeCommand("getVolume");
    sendYoutubeCommand("getPlayerState");
    sendYoutubeCommand("isMuted");
    sendYoutubeCommand("getPlaybackRate");
    sendYoutubeCommand("getPlaybackQuality");
  }, [isDirectVideo, playbackEmbedUrl, sendYoutubeCommand]);

  const initializeYoutubeBridge = useCallback(() => {
    const iframe = youtubeFrameRef.current;
    if (!iframe?.contentWindow || !playbackEmbedUrl || isDirectVideo) return;
    iframe.contentWindow.postMessage(JSON.stringify({ event: "listening", id: "watch-player" }), "*");
    sendYoutubeCommand("addEventListener", ["onStateChange"]);
    sendYoutubeCommand("addEventListener", ["onPlaybackRateChange"]);
    sendYoutubeCommand("addEventListener", ["onPlaybackQualityChange"]);
    requestYoutubeSnapshot();
  }, [isDirectVideo, playbackEmbedUrl, requestYoutubeSnapshot, sendYoutubeCommand]);

  useEffect(() => {
    if (isDirectVideo || !playbackEmbedUrl) return;

    if (playerIsMuted) {
      sendYoutubeCommand("mute");
      return;
    }

    sendYoutubeCommand("unMute");
    sendYoutubeCommand("setVolume", [Math.round(Math.max(0, Math.min(1, playerVolume)) * 100)]);
  }, [isDirectVideo, playbackEmbedUrl, playerIsMuted, playerVolume, sendYoutubeCommand]);

  const loadRatings = useCallback(async () => {
    if (!validMovieId) return;
    setRatingsLoading(true);
    try {
      const response = await fetch(`/api/ratings/${validMovieId}`);
      if (!response.ok) return;
      const payload = await response.json() as RatingApiResponse;
      setAverageRating(Number(payload.averageRating || 0));
      setRatingCount(Number(payload.ratingCount || 0));
      setUserRating(typeof payload.userRating === "number" ? payload.userRating : null);
    } catch (error) {
      console.error("Failed to load ratings:", error);
    } finally {
      setRatingsLoading(false);
    }
  }, [validMovieId]);

  const loadFavoriteCount = useCallback(async () => {
    if (!validMovieId) return;
    try {
      const response = await fetch(`/api/favorites/count/${validMovieId}`);
      if (!response.ok) return;
      const payload = await response.json() as FavoriteCountApiResponse;
      setFavoriteCount(Math.max(0, Number(payload.favoriteCount || 0)));
    } catch (error) {
      console.error("Failed to load favorite count:", error);
    }
  }, [validMovieId]);

  const toggleFavorite = useCallback(async () => {
    if (!validMovieId || favoriteSubmitting) return;
    if (!currentUser?.email) {
      router.push("/auth");
      return;
    }

    const nextFavoriteState = !isFavorite;
    setFavoriteSubmitting(true);
    setFavoriteCount((prev) => Math.max(0, prev + (nextFavoriteState ? 1 : -1)));

    try {
      const response = await fetch(nextFavoriteState ? "/api/favorite" : "/api/deletefavorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: validMovieId }),
      });

      if (response.status === 401) {
        router.push("/auth");
        return;
      }

      if (!response.ok) {
        setFavoriteCount((prev) => Math.max(0, prev + (nextFavoriteState ? -1 : 1)));
        return;
      }

      const payload = await response.json() as { favoriteIds?: string[] };
      const nextFavoriteIds = Array.isArray(payload.favoriteIds) ? payload.favoriteIds : [];
      await mutateCurrentUser(
        {
          ...(currentUser || {}),
          favoriteIds: nextFavoriteIds,
        },
        false
      );
      await loadFavoriteCount();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setFavoriteCount((prev) => Math.max(0, prev + (nextFavoriteState ? -1 : 1)));
    } finally {
      setFavoriteSubmitting(false);
    }
  }, [currentUser, favoriteSubmitting, isFavorite, loadFavoriteCount, mutateCurrentUser, router, validMovieId]);

  const submitRating = useCallback(async (value: number) => {
    if (!validMovieId || value < 1 || value > 5) return;
    setRatingSubmitting(true);
    try {
      const response = await fetch(`/api/ratings/${validMovieId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });

      if (response.status === 401) {
        router.push("/auth");
        return;
      }

      if (!response.ok) return;
      const payload = await response.json() as RatingApiResponse;
      setAverageRating(Number(payload.averageRating || 0));
      setRatingCount(Number(payload.ratingCount || 0));
      setUserRating(typeof payload.userRating === "number" ? payload.userRating : value);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setRatingSubmitting(false);
    }
  }, [router, validMovieId]);

  useEffect(() => {
    if (showPlaybackIntro) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= 24) {
        setHeaderMode("brand");
        lastY = currentY;
        return;
      }

      if (currentY > lastY + 2) setHeaderMode("title");
      if (currentY < lastY - 2) setHeaderMode("brand");
      lastY = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showPlaybackIntro]);

  const handlePlaybackIntroFinished = useCallback(() => {
    if (!introKey) return;
    setCompletedIntroKey((prev) => (prev === introKey ? prev : introKey));
  }, [introKey]);

  useEffect(() => {
    setPlayerCurrentTime(0);
    setPlayerDuration(0);
    setPlayerIsPlaying(true);
    setPlayerIsMuted(false);
    setCaptionsEnabled(false);
    setPlaybackRate(1);
    setPlaybackQuality("auto");
    setPlayerVolume(1);
    setShowSettingsPanel(false);
    lastPlayerSyncAtRef.current = Date.now();
  }, [chosenUrl, fallbackDurationSeconds, showPlaybackIntro]);

  useEffect(() => {
    if (isDirectVideo || !playbackEmbedUrl) return;
    if (playerDuration > 0) return;
    if (fallbackDurationSeconds <= 0) return;
    setPlayerDuration(fallbackDurationSeconds);
  }, [fallbackDurationSeconds, isDirectVideo, playbackEmbedUrl, playerDuration]);

  useEffect(() => {
    if (!isDirectVideo || !playbackSourceUrl || showPlaybackIntro) return;
    const player = directVideoRef.current;
    if (!player) return;

    let cancelled = false;
    const tryAutoPlay = async () => {
      player.muted = false;
      setPlayerIsMuted(false);

      try {
        await player.play();
      } catch {
        if (cancelled) return;
        // Fallback for strict autoplay policies.
        player.muted = true;
        setPlayerIsMuted(true);
        await player.play().catch(() => {});
      }
    };

    void tryAutoPlay();
    return () => {
      cancelled = true;
    };
  }, [isDirectVideo, playbackSourceUrl, showPlaybackIntro]);

  useEffect(() => {
    if (!validMovieId) return;
    void loadRatings();
  }, [loadRatings, validMovieId]);

  useEffect(() => {
    if (!validMovieId) return;
    void loadFavoriteCount();
  }, [loadFavoriteCount, validMovieId]);

  useEffect(() => {
    if (!validMovieId || !chosenUrl || showPlaybackIntro) return;

    const modeKey = isTrailerMode ? "trailer" : "movie";
    const trackKey = `${validMovieId}:${modeKey}`;
    if (trackedViewKeyRef.current === trackKey) return;
    trackedViewKeyRef.current = trackKey;

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movieId: validMovieId,
        eventType: "view",
        mode: modeKey,
      }),
    }).catch(() => {});
  }, [chosenUrl, isTrailerMode, showPlaybackIntro, validMovieId]);

  useEffect(() => () => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!showShareModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowShareModal(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showShareModal]);

  useEffect(() => {
    const syncFullscreenState = () => {
      const activeElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(Boolean(activeElement));
    };
    const webkitFullscreenListener = syncFullscreenState as EventListener;

    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", webkitFullscreenListener);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("webkitfullscreenchange", webkitFullscreenListener);
    };
  }, []);

  useEffect(() => {
    if (isDirectVideo || !playbackEmbedUrl) return;

    const onMessage = (event: MessageEvent) => {
      if (!String(event.origin).includes("youtube")) return;
      let payload: any = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      if (!payload) return;
      if (payload.event === "onReady") {
        requestYoutubeSnapshot();
        return;
      }
      if (payload.event === "onStateChange") {
        const state = coerceNumber(payload.info);
        if (state !== null) setPlayerIsPlaying(state === 1);
      }
      if (payload.event === "onPlaybackQualityChange") {
        const quality = normalizeYoutubeQuality(payload.info);
        if (quality) setPlaybackQuality(quality);
      }
      if (payload.event !== "infoDelivery" || !payload.info) return;
      const info = payload.info as Record<string, unknown>;

      const currentTime = coerceNumber(info.currentTime);
      if (currentTime !== null && currentTime >= 0) {
        setPlayerCurrentTime(currentTime);
        lastPlaybackTimeRef.current = currentTime;
        lastPlayerSyncAtRef.current = Date.now();
      }
      const duration = coerceNumber(info.duration);
      if (duration !== null && duration > 0) {
        setPlayerDuration(duration);
      }
      const volumeValue = coerceNumber(info.volume);
      if (volumeValue !== null) {
        const normalized = volumeValue > 1 ? volumeValue / 100 : volumeValue;
        setPlayerVolume(Math.max(0, Math.min(1, normalized)));
      }
      const playerState = coerceNumber(info.playerState);
      if (playerState !== null) {
        setPlayerIsPlaying(playerState === 1);
      }
      if (typeof info.muted === "boolean") {
        setPlayerIsMuted(info.muted);
      }
      const speed = coerceNumber(info.playbackRate);
      if (speed !== null && speed > 0) {
        setPlaybackRate(speed);
      }
      const quality = normalizeYoutubeQuality(info.playbackQuality);
      if (quality) {
        setPlaybackQuality(quality);
      }
    };

    window.addEventListener("message", onMessage);
    const timer = window.setInterval(() => requestYoutubeSnapshot(), 700);
    initializeYoutubeBridge();

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("message", onMessage);
    };
  }, [initializeYoutubeBridge, isDirectVideo, playbackEmbedUrl, requestYoutubeSnapshot]);

  useEffect(() => {
    if (isDirectVideo || !playbackEmbedUrl) return;
    if (!playerIsPlaying || playerDuration <= 0) return;

    const timer = window.setInterval(() => {
      const syncedRecently = Date.now() - lastPlayerSyncAtRef.current < 1400;
      if (syncedRecently) return;
      setPlayerCurrentTime((prev) => Math.min(playerDuration, prev + 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isDirectVideo, playbackEmbedUrl, playerDuration, playerIsPlaying]);

  const handleDirectLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const player = event.currentTarget;
    const duration = Number.isFinite(player.duration) && player.duration > 0
      ? player.duration
      : fallbackDurationSeconds;
    setPlayerDuration(duration);
    setPlayerVolume(Math.max(0, Math.min(1, player.volume || 1)));
    lastPlayerSyncAtRef.current = Date.now();

    if (INTRO_SKIP_SECONDS > 0 && duration > INTRO_SKIP_SECONDS) {
      try {
        player.currentTime = INTRO_SKIP_SECONDS;
        setPlayerCurrentTime(INTRO_SKIP_SECONDS);
        lastPlaybackTimeRef.current = INTRO_SKIP_SECONDS;
        lastPlayerSyncAtRef.current = Date.now();
      } catch {
        // Some stream formats reject immediate seek.
      }
    }
  };

  const handleDirectTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const current = event.currentTarget.currentTime;
    setPlayerCurrentTime(current);
    lastPlayerSyncAtRef.current = Date.now();
    if (WATCH_LOCK_PLAYER_CONTROLS) lastPlaybackTimeRef.current = current;
  };

  const handleDirectPlay = () => setPlayerIsPlaying(true);

  const handleDirectPause = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!WATCH_LOCK_PLAYER_CONTROLS) {
      setPlayerIsPlaying(false);
      return;
    }

    const player = event.currentTarget;
    if (player.ended) {
      setPlayerIsPlaying(false);
      return;
    }
    void player.play().catch(() => {});
  };

  const handleDirectSeeking = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!WATCH_LOCK_PLAYER_CONTROLS) return;
    const player = event.currentTarget;
    const lockedTime = lastPlaybackTimeRef.current;
    if (Math.abs(player.currentTime - lockedTime) < 0.35) return;
    try {
      player.currentTime = lockedTime;
    } catch {
      // Ignore abrupt seek correction failures.
    }
  };

  const handleDirectRateChange = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const player = event.currentTarget;
    if (WATCH_LOCK_PLAYER_CONTROLS && player.playbackRate !== 1) {
      player.playbackRate = 1;
    }
    setPlaybackRate(player.playbackRate || 1);
  };

  const handleDirectVolumeChange = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const player = event.currentTarget;
    setPlayerIsMuted(player.muted);
    setPlayerVolume(Math.max(0, Math.min(1, player.volume || 0)));
  };

  const togglePlayPause = async () => {
    if (isDirectVideo) {
      const player = directVideoRef.current;
      if (!player) return;

      if (player.paused) {
        await player.play().catch(() => {});
      } else {
        player.pause();
      }
      return;
    }

    if (!playbackEmbedUrl) return;
    sendYoutubeCommand(playerIsPlaying ? "pauseVideo" : "playVideo");
    setPlayerIsPlaying((prev) => !prev);
  };

  const seekTo = (targetSeconds: number) => {
    const clamped = Math.max(0, Math.min(playerDuration || targetSeconds, targetSeconds));

    if (isDirectVideo) {
      const player = directVideoRef.current;
      if (!player) return;
      player.currentTime = clamped;
      setPlayerCurrentTime(clamped);
      return;
    }

    if (!playbackEmbedUrl) return;
    sendYoutubeCommand("seekTo", [clamped, true]);
    setPlayerCurrentTime(clamped);
  };

  const seekBy = (deltaSeconds: number) => seekTo(playerCurrentTime + deltaSeconds);

  const handleVideoSurfaceToggle = () => {
    setShowSettingsPanel(false);
    void togglePlayPause();
  };

  const toggleMute = () => {
    if (isDirectVideo) {
      const player = directVideoRef.current;
      if (!player) return;
      const nextMuted = !player.muted;
      if (!nextMuted && player.volume <= 0) {
        const restoredVolume = playerVolume > 0 ? playerVolume : 1;
        player.volume = restoredVolume;
      }
      player.muted = nextMuted;
      setPlayerIsMuted(nextMuted);
      return;
    }

    if (!playbackEmbedUrl) return;
    sendYoutubeCommand(playerIsMuted ? "unMute" : "mute");
    setPlayerIsMuted((prev) => !prev);
  };

  const changeVolume = (value: number) => {
    const volume = Math.max(0, Math.min(1, value));
    setPlayerVolume(volume);

    if (isDirectVideo) {
      const player = directVideoRef.current;
      if (!player) return;
      player.volume = volume;
      player.muted = volume <= 0;
      setPlayerIsMuted(player.muted);
      return;
    }

    if (!playbackEmbedUrl) return;
    if (volume <= 0) {
      sendYoutubeCommand("mute");
      setPlayerIsMuted(true);
    } else {
      if (playerIsMuted) sendYoutubeCommand("unMute");
      sendYoutubeCommand("setVolume", [volume * 100]);
      setPlayerIsMuted(false);
    }
  };

  const toggleCaptions = () => {
    if (isDirectVideo) {
      const player = directVideoRef.current;
      if (!player) return;
      const next = !captionsEnabled;
      for (let i = 0; i < player.textTracks.length; i += 1) {
        player.textTracks[i].mode = next ? "showing" : "hidden";
      }
      setCaptionsEnabled(next);
      return;
    }

    if (!playbackEmbedUrl) return;
    const next = !captionsEnabled;
    if (next) {
      sendYoutubeCommand("loadModule", ["captions"]);
      sendYoutubeCommand("setOption", ["captions", "track", { languageCode: "vi" }]);
    } else {
      sendYoutubeCommand("setOption", ["captions", "track", {}]);
    }
    setCaptionsEnabled(next);
  };

  const changePlaybackRate = (value: number) => {
    const nextRate = Math.max(0.5, Math.min(2, value));
    setPlaybackRate(nextRate);

    if (isDirectVideo) {
      const player = directVideoRef.current;
      if (!player) return;
      player.playbackRate = nextRate;
      return;
    }

    if (!playbackEmbedUrl) return;
    sendYoutubeCommand("setPlaybackRate", [nextRate]);
  };

  const changePlaybackQuality = (value: YoutubePlaybackQuality) => {
    setPlaybackQuality(value);
    if (isDirectVideo || !playbackEmbedUrl) return;
    if (value === "auto") {
      sendYoutubeCommand("setPlaybackQuality", ["default"]);
      return;
    }
    sendYoutubeCommand("setPlaybackQuality", [value]);
  };

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((prev) => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (!prev) {
        window.setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery("");
        setSearchResults([]);
      }
      return !prev;
    });
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          setSearchResults([]);
          return;
        }
        const payload = await response.json();
        setSearchResults(Array.isArray(payload) ? payload : []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleResultClick = useCallback((targetMovieId: string) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/watch/${targetMovieId}`);
  }, [router]);

  const openShareWindow = useCallback((url: string) => {
    if (!url || typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer,width=760,height=680");
  }, []);

  const openShareModal = useCallback(() => {
    setShareCopied(false);
    setShowShareModal(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const handleShareFacebook = useCallback(() => {
    if (!effectiveShareUrl) return;
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(effectiveShareUrl)}`);
    setShowShareModal(false);
  }, [effectiveShareUrl, openShareWindow]);

  const handleShareWhatsApp = useCallback(() => {
    if (!effectiveShareUrl) return;
    const text = `${shareTitle} ${effectiveShareUrl}`.trim();
    openShareWindow(`https://wa.me/?text=${encodeURIComponent(text)}`);
    setShowShareModal(false);
  }, [effectiveShareUrl, openShareWindow, shareTitle]);

  const handleShareX = useCallback(() => {
    if (!effectiveShareUrl) return;
    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(effectiveShareUrl)}`
    );
    setShowShareModal(false);
  }, [effectiveShareUrl, openShareWindow, shareTitle]);

  const handleShareInstagram = useCallback(async () => {
    if (!effectiveShareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: effectiveShareUrl,
        });
        setShowShareModal(false);
        return;
      } catch {
        // Fallback to opening Instagram web if user cancels or share is unavailable.
      }
    }
    openShareWindow("https://www.instagram.com/");
    setShowShareModal(false);
  }, [effectiveShareUrl, openShareWindow, shareTitle]);

  const handleShareEmail = useCallback(() => {
    if (!effectiveShareUrl || typeof window === "undefined") return;
    const subject = encodeURIComponent(`Chia sẻ phim: ${shareTitle}`);
    const body = encodeURIComponent(`${shareTitle}\n${effectiveShareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareModal(false);
  }, [effectiveShareUrl, shareTitle]);

  const handleShareZalo = useCallback(() => {
    if (!effectiveShareUrl) return;
    openShareWindow(`https://zalo.me/share?url=${encodeURIComponent(effectiveShareUrl)}`);
    setShowShareModal(false);
  }, [effectiveShareUrl, openShareWindow]);

  const handleCopyShareLink = useCallback(async () => {
    if (!effectiveShareUrl || typeof window === "undefined") return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(effectiveShareUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = effectiveShareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  }, [effectiveShareUrl]);

  const scrollToComments = () => {
    commentAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFullscreen = () => {
    const playerContainer = document.getElementById("watch-player-container");
    if (!playerContainer) return;

    if (!isFullscreen) {
      if (playerContainer.requestFullscreen) {
        playerContainer.requestFullscreen();
      } else if ((playerContainer as any).webkitRequestFullscreen) {
        (playerContainer as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitFullscreenElement && (document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const watchNavLinkClass = "text-white/90 hover:text-red-500 transition-all duration-200 transform-gpu will-change-transform origin-left inline-block hover:[transform:perspective(720px)_translate3d(0,-6px,42px)_scale(1.15)] hover:[text-shadow:0_8px_20px_rgba(239,68,68,0.45)]";
  const watchHeaderActions = (
    <div className="flex flex-row gap-6 items-center">
      <div className="relative">
        <div
          className={`flex items-center transition-all duration-300 ${
            showSearch ? "bg-black/75 border border-white/30 rounded-sm" : ""
          }`}
        >
          <div
            onClick={toggleSearch}
            className="text-gray-200 hover:text-gray-300 cursor-pointer transition p-2"
          >
            {showSearch ? <AiOutlineClose /> : <BsSearch />}
          </div>
          {showSearch && (
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm phim..."
              className="bg-transparent text-white text-sm outline-none w-[200px] md:w-[280px] pr-3 py-1"
            />
          )}
        </div>

        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full right-0 mt-2 w-[300px] md:w-[350px] bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl max-h-[400px] overflow-y-auto z-50">
            {searchResults.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleResultClick(item.id)}
                className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition border-b border-zinc-800 last:border-b-0"
              >
                {item.thumbnailUrl && (
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    className="w-16 h-10 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {item.title}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {item.genre || ""} {item.duration ? `• ${item.duration} phút` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSearch && searchQuery && searchResults.length === 0 && !searching && (
          <div className="absolute top-full right-0 mt-2 w-[300px] bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl p-4 z-50">
            <p className="text-gray-400 text-sm text-center">Không tìm thấy phim</p>
          </div>
        )}
      </div>

      <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
        <BsBell />
      </div>

      <div
        onClick={toggleAccountMenu}
        className="flex flex-row items-center gap-2 cursor-pointer relative"
      >
        <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-md overflow-hidden">
          <img
            src="/images/default-blue.png"
            alt="profile image"
            className="w-full h-full object-cover block"
          />
        </div>
        <BsChevronDown className={`text-white transition ${showAccountMenu ? "rotate-180" : "rotate-0"}`} />
        <AccountMenu visible={showAccountMenu} />
      </div>
    </div>
  );

  if (isLoading || !validMovieId) {
    return <IntroN preferVideo videoUrl={BRAND_INTRO_URL} alt="Loading intro" />;
  }

  if (showPlaybackIntro) {
    return (
      <IntroN
        preferVideo
        videoUrl={BRAND_INTRO_URL}
        alt="Brand intro"
        onFinished={handlePlaybackIntroFinished}
        finishAfterMs={INTRO_DURATION_MS}
      />
    );
  }

  return (
    <div className="min-h-screen w-screen bg-black">
      <div className="fixed inset-x-0 top-0 z-40 h-[68px]">
        <nav
          className={`absolute inset-x-0 top-0 h-[68px] px-4 sm:px-12 py-4 bg-transparent transition-all duration-300 flex items-center ${
            headerMode === "brand" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          <div className="flex items-center w-full">
            <Link href="/">
              <img src="/images/logo.png" alt="logo" className="h-5 sm:h-8" />
            </Link>
            <div className="hidden lg:flex items-center ml-8 gap-7 text-sm text-white/90">
              <Link href="/" className={watchNavLinkClass}>Home</Link>
              <Link href="/series" className={watchNavLinkClass}>Series</Link>
              <Link href="/films" className={watchNavLinkClass}>Films</Link>
              <Link href="/new" className={watchNavLinkClass}>New & Popular</Link>
              <Link href="/my-list" className={watchNavLinkClass}>My List</Link>
              <Link href="/languages" className={watchNavLinkClass}>Browse by Languages</Link>
            </div>
            <div className="lg:hidden ml-4">
              <Link href="/" className="text-white/90 hover:text-red-500 text-sm transition-all duration-200 transform-gpu will-change-transform origin-left inline-block hover:[transform:perspective(720px)_translate3d(0,-6px,42px)_scale(1.15)] hover:[text-shadow:0_8px_20px_rgba(239,68,68,0.45)]">Home</Link>
            </div>
          </div>
        </nav>

        <nav
          className={`absolute inset-x-0 top-0 h-[68px] px-4 sm:px-8 py-3 bg-transparent transition-all duration-300 flex items-center ${
            headerMode === "title" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-4 w-full">
            <Link href="/">
              <AiOutlineArrowLeft className="text-white cursor-pointer" size={28} />
            </Link>
            <p className="text-white text-lg md:text-2xl font-semibold truncate">
              {movie?.title || "Đang tải..."}
            </p>
          </div>
        </nav>
        <div className="absolute right-4 sm:right-8 top-0 h-[68px] flex items-center z-50">
          {watchHeaderActions}
        </div>
      </div>

      <div className="pt-16">
        <div
          id="watch-player-container"
          className="relative h-screen bg-black"
        >
          {!chosenUrl ? (
            <div className="h-full w-full flex items-center justify-center text-white text-xl text-center px-4">
              Chưa có link {isTrailerMode ? "trailer" : "phim"} cho nội dung này.
            </div>
          ) : isDirectVideo ? (
            <video
              ref={directVideoRef}
              className="h-full w-full"
              autoPlay
              muted={playerIsMuted}
              playsInline
              controls={false}
              tabIndex={WATCH_LOCK_PLAYER_CONTROLS ? -1 : 0}
              disablePictureInPicture={WATCH_LOCK_PLAYER_CONTROLS}
              controlsList={WATCH_LOCK_PLAYER_CONTROLS ? "nodownload noplaybackrate noremoteplayback nofullscreen" : undefined}
              onContextMenu={WATCH_LOCK_PLAYER_CONTROLS ? (event) => event.preventDefault() : undefined}
              onLoadedMetadata={handleDirectLoadedMetadata}
              onTimeUpdate={handleDirectTimeUpdate}
              onPlay={handleDirectPlay}
              onPause={handleDirectPause}
              onSeeking={handleDirectSeeking}
              onRateChange={handleDirectRateChange}
              onVolumeChange={handleDirectVolumeChange}
              onEnded={() => setPlayerIsPlaying(false)}
              poster={movie?.thumbnailUrl}
              src={chosenUrl}
            />
          ) : playbackEmbedUrl ? (
            <div className="relative h-full w-full overflow-hidden bg-black">
              <iframe
                ref={youtubeFrameRef}
                id="watch-player"
                className="absolute inset-0 h-full w-full"
                src={playbackEmbedUrl}
                title={movie?.title || "Trailer"}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={initializeYoutubeBridge}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/65 to-transparent" />
            </div>
          ) : isYouTubeSource && !ALLOW_YOUTUBE_WATCH_EMBED ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-white text-center px-6 gap-3">
              <p className="text-xl font-semibold">Đang chặn YouTube embed để tránh lỗi "not a bot".</p>
              <p className="text-white/75">
                Để xem trong Nextflix, vui lòng dùng link video trực tiếp (mp4/m3u8) trong trang admin.
              </p>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white text-xl text-center px-6">
              Link này không hỗ trợ phát inline ổn định.
            </div>
          )}

          {isPlayableSurface ? (
            <button
              type="button"
              className="absolute inset-0 z-10 cursor-pointer bg-transparent"
              onClick={handleVideoSurfaceToggle}
              aria-label={playerIsPlaying ? "Tạm dừng video" : "Phát video"}
              title={playerIsPlaying ? "Tạm dừng video" : "Phát video"}
            />
          ) : null}

          {isPlayableSurface && chosenUrl ? (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 sm:px-8 pb-4 pt-10">
              <input
                type="range"
                min={0}
                max={Math.max(playerDuration, 1)}
                step={0.1}
                value={Math.min(playerCurrentTime, Math.max(playerDuration, 1))}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-red-600"
                style={progressTrackStyle}
                disabled={playerDuration <= 0}
              />

              <div className="mt-3 flex items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3 sm:gap-5">
                  <button
                    onClick={togglePlayPause}
                    className="text-white/90 hover:text-red-500 transition-colors"
                    title="Play / Pause"
                    aria-label="Play or pause"
                  >
                    {playerIsPlaying ? <BsPauseFill size={30} /> : <BsPlayFill size={30} />}
                  </button>
                  <button
                    onClick={() => seekBy(-10)}
                    className="text-white/90 hover:text-red-500 transition-colors"
                    title="Lùi 10 giây"
                    aria-label="Lùi 10 giây"
                  >
                    <BiUndo size={30} />
                  </button>
                  <button
                    onClick={() => seekBy(10)}
                    className="text-white/90 hover:text-red-500 transition-colors"
                    title="Tiến 10 giây"
                    aria-label="Tiến 10 giây"
                  >
                    <BiRedo size={30} />
                  </button>
                  <div className="group/volume flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-white/90 hover:text-red-500 transition-colors"
                      title="Âm thanh"
                      aria-label="Bật tắt âm thanh"
                    >
                      {playerIsMuted ? <IoVolumeMuteOutline size={28} /> : <IoVolumeHighOutline size={28} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={playerIsMuted ? 0 : playerVolume}
                      onChange={(event) => changeVolume(Number(event.target.value))}
                      className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/20 accent-red-600 opacity-0 pointer-events-none transition-all duration-200 group-hover/volume:w-24 group-hover/volume:opacity-100 group-hover/volume:pointer-events-auto focus:w-24 focus:opacity-100 focus:pointer-events-auto"
                      style={volumeTrackStyle}
                      aria-label="Điều chỉnh âm lượng"
                    />
                  </div>
                  <button
                    onClick={toggleCaptions}
                    className={`transition-colors ${captionsEnabled ? "text-red-500" : "text-white/75 hover:text-red-500"}`}
                    title="Phụ đề Việt"
                    aria-label="Phụ đề Việt"
                  >
                    <MdClosedCaption size={28} />
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => setShowSettingsPanel((prev) => !prev)}
                    className={`transition-colors ${showSettingsPanel ? "text-red-500" : "text-white/80 hover:text-red-500"}`}
                    title="Cài đặt"
                    aria-label="Cài đặt"
                  >
                    <IoSettingsOutline size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="text-white/80 hover:text-red-500 transition-colors"
                    title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                    aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  >
                    {isFullscreen ? <MdFullscreenExit size={28} /> : <MdFullscreen size={28} />}
                  </button>
                  <span className="text-xs sm:text-sm text-white/85 tabular-nums">
                    {formatTime(playerCurrentTime)} / {formatTime(playerDuration)}
                  </span>
                </div>
              </div>

              {showSettingsPanel ? (
                <div className="absolute right-4 sm:right-8 bottom-16 w-60 rounded-md border border-white/15 bg-black/90 p-3">
                  <p className="text-white/90 text-xs mb-2">Tốc độ phát</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[0.5, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`rounded px-2 py-1 text-xs ${
                          Math.abs(playbackRate - rate) < 0.01
                            ? "bg-white text-black"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="text-white/90 text-xs mb-2">Chất lượng</p>
                    {!isDirectVideo && playbackEmbedUrl ? (
                      <div className="grid grid-cols-2 gap-2">
                        {YOUTUBE_QUALITY_OPTIONS.map((quality) => (
                          <button
                            key={quality.value}
                            onClick={() => changePlaybackQuality(quality.value)}
                            className={`rounded px-2 py-1 text-xs ${
                              playbackQuality === quality.value
                                ? "bg-white text-black"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            {quality.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] leading-relaxed text-white/55">
                        Nguồn video này chưa hỗ trợ đổi chất lượng thủ công.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {movie ? (
          <section className="px-4 sm:px-10 py-5 bg-[#101010] border-y border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <h2 className="text-white text-2xl md:text-3xl font-semibold">{movie.title}</h2>
                <div className="mt-3 flex items-center gap-3 text-white/85 text-base md:text-lg">
                  <span>{formattedViewCount} lượt xem</span>
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="flex items-center gap-0.5 text-[#f5c518]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= Math.round(averageRating) ? <AiFillStar key={star} size={18} /> : <AiOutlineStar key={star} size={18} />
                    ))}
                  </span>
                  <span className="text-white/60 text-sm">({ratingCountLabel})</span>
                </div>

                <div className="mt-4">
                  <p className="text-white/80 text-sm mb-2">
                    {ratingsLoading ? "Đang tải đánh giá..." : "Chấm sao của bạn"}
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => void submitRating(star)}
                        disabled={ratingSubmitting}
                        className={`transition-colors ${star <= (userRating || 0) ? "text-[#f5c518]" : "text-white/35 hover:text-red-500"}`}
                        title={`${star} sao`}
                      >
                        <AiFillStar size={28} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <button
                  onClick={scrollToComments}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 hover:border-red-500/70 hover:text-red-500 transition-colors"
                >
                  <BiCommentDetail size={22} />
                  <span className="text-sm font-medium">Bình luận</span>
                </button>

                <button
                  onClick={() => void toggleFavorite()}
                  disabled={favoriteSubmitting}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                    isFavorite
                      ? "border-red-500/80 bg-red-500/10 text-red-500"
                      : "border-white/20 bg-white/5 hover:border-red-500/70 hover:text-red-500"
                  } ${favoriteSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  title={isFavorite ? "Bỏ tim phim" : "Thả tim phim"}
                  aria-label={isFavorite ? "Bỏ tim phim" : "Thả tim phim"}
                >
                  <AiOutlineHeart size={22} />
                  <span className="text-lg font-semibold leading-none tabular-nums">{favoriteCountLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={openShareModal}
                  className="h-11 w-11 inline-flex items-center justify-center rounded-xl border border-white/15 bg-zinc-900/90 text-white/90 shadow-lg shadow-black/35 transition-colors hover:border-white/45 hover:text-white"
                  title="Chia sẻ"
                  aria-label="Chia sẻ"
                >
                  <BiShareAlt size={20} />
                </button>

                {shareCopied ? (
                  <span className="rounded-lg border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-300">
                    Đã copy
                  </span>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {showShareModal ? (
          <div
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-[1.5px] p-3 sm:p-6"
            onClick={closeShareModal}
          >
            <div
              className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/10 bg-[#1a1b1f] shadow-2xl shadow-black/65"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-white text-lg font-semibold">Đăng bài để chia sẻ</p>
                  <p className="text-white/55 text-xs mt-1">Chia sẻ nhanh đến bạn bè</p>
                </div>
                <button
                  type="button"
                  onClick={closeShareModal}
                  className="text-white/75 hover:text-white transition-colors"
                  aria-label="Đóng chia sẻ"
                >
                  <AiOutlineClose size={24} />
                </button>
              </div>

              <div className="px-5 py-4">
                <p className="text-white/85 text-sm mb-3">Chia sẻ</p>
                <div className="flex items-start gap-4 overflow-x-auto pb-2">
                  <button
                    type="button"
                    onClick={() => void handleCopyShareLink()}
                    className="min-w-[74px] flex flex-col items-center gap-2 text-white/90"
                  >
                    <span className="h-14 w-14 rounded-full bg-white/15 border border-white/20 inline-flex items-center justify-center">
                      <BsLink45Deg size={20} />
                    </span>
                    <span className="text-xs">Nhúng</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="min-w-[74px] flex flex-col items-center gap-2 text-white/90"
                  >
                    <span className="h-14 w-14 rounded-full bg-white inline-flex items-center justify-center">
                      <SiFacebook className="h-8 w-8 text-[#1877F2]" />
                    </span>
                    <span className="text-xs">Facebook</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="min-w-[74px] flex flex-col items-center gap-2 text-white/90"
                  >
                    <span className="h-14 w-14 rounded-full bg-[#25D366] inline-flex items-center justify-center">
                      <BsWhatsapp size={24} />
                    </span>
                    <span className="text-xs">WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareX}
                    className="min-w-[74px] flex flex-col items-center gap-2 text-white/90"
                  >
                    <span className="h-14 w-14 rounded-full bg-white inline-flex items-center justify-center">
                      <SiX className="h-8 w-8 text-black" />
                    </span>
                    <span className="text-xs">X</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareEmail}
                    className="min-w-[74px] flex flex-col items-center gap-2 text-white/90"
                  >
                    <span className="h-14 w-14 rounded-full bg-white inline-flex items-center justify-center">
                      <SiGmail className="h-8 w-8 text-[#EA4335]" />
                    </span>
                    <span className="text-xs">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareZalo}
                    className="min-w-[74px] flex flex-col items-center gap-2 text-white/90"
                  >
                    <span className="h-14 w-14 rounded-full bg-white inline-flex items-center justify-center">
                      <SiZalo className="h-8 w-8 text-[#0068FF]" />
                    </span>
                    <span className="text-xs">Zalo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleShareInstagram()}
                    className="min-w-[74px] flex flex-col items-center gap-2 text-white/90"
                  >
                    <span className="h-14 w-14 rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] inline-flex items-center justify-center">
                      <BsInstagram size={22} />
                    </span>
                    <span className="text-xs">Instagram</span>
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-white/15 bg-black/35 p-2 flex items-center gap-2">
                  <input
                    value={effectiveShareUrl}
                    readOnly
                    className="w-full bg-transparent px-2 py-2 text-sm text-white/90 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCopyShareLink()}
                    className="shrink-0 rounded-full bg-[#2ea2ff] px-4 py-2 text-sm font-semibold text-black hover:bg-[#56b3ff] transition-colors"
                  >
                    {shareCopied ? "Đã copy" : "Sao chép"}
                  </button>
                </div>

                <label className="mt-4 inline-flex items-center gap-2 text-white/70 text-sm">
                  <input
                    type="checkbox"
                    checked={shareAtCurrentTime}
                    onChange={(event) => setShareAtCurrentTime(event.target.checked)}
                    className="h-4 w-4 rounded border-white/35 bg-transparent"
                  />
                  <span>Bắt đầu tại {formatTime(shareStartSeconds)}</span>
                </label>
              </div>
            </div>
          </div>
        ) : null}

        <div ref={commentAnchorRef}>
          {movieId && <CommentSection movieId={movieId} />}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;


