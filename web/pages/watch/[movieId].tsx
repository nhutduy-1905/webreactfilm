import React, { useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";
import useMovie from "../../hooks/useMovie";
import CommentSection from "../../components/CommentSection";

function toYoutubeEmbed(raw: string): string {
  try {
    const u = new URL(raw.trim());

    // youtube.com/watch?v=...
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

      // youtube.com/shorts/<id>
      if (u.pathname.startsWith("/shorts/")) {
        const shortId = u.pathname.split("/")[2];
        if (shortId) {
          return `https://www.youtube.com/embed/${shortId}?autoplay=1&rel=0`;
        }
      }

      // youtube.com/embed/<id>
      if (u.pathname.startsWith("/embed/")) return raw;
    }

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }

    return "";
  } catch {
    return "";
  }
}

const WatchPage = () => {
  const router = useRouter();
  const { movieId, mode } = router.query as { movieId?: string; mode?: string };

  // Validate movieId trước khi gọi hook
  const validMovieId = movieId && movieId.trim() !== "" ? movieId : null;
  const { data: movie, isLoading } = useMovie(validMovieId || "");

  const isTrailerMode = mode === "trailer";

  // map linh hoạt field để tránh lệch schema
  const movieUrl = useMemo(() => {
    if (!movie) return "";
    return String(
      movie.videoUrl ?? movie.movieUrl ?? movie.video_url ?? ""
    ).trim();
  }, [movie]);

  const trailerUrl = useMemo(() => {
    if (!movie) return "";
    return String(
      movie.trailerUrl ?? movie.trailer_url ?? ""
    ).trim();
  }, [movie]);

  // QUAN TRỌNG: không fallback chéo nữa
  const chosenUrl = isTrailerMode ? trailerUrl : movieUrl;

  const isDirectVideo = useMemo(() => {
    return /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(chosenUrl);
  }, [chosenUrl]);

  const trailerEmbedUrl = useMemo(() => {
    if (!chosenUrl) return "";
    return toYoutubeEmbed(chosenUrl);
  }, [chosenUrl]);

  // Hiển thị loading
  if (isLoading || !validMovieId) {
    return (
      <div className="min-h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-black">
      <nav className="fixed w-full p-4 z-10 flex flex-row items-center gap-6 bg-black/80">
        <Link href="/">
          <AiOutlineArrowLeft className="text-white cursor-pointer" size={30} />
        </Link>

        {/* bỏ chữ Watching */}
        <p className="text-white text-xl md:text-3xl font-bold">
          {movie?.title || "Đang tải..."}
        </p>
      </nav>

      <div className="pt-16">
        <div className="h-screen">
          {!chosenUrl ? (
            <div className="h-full w-full flex items-center justify-center text-white text-xl text-center px-4">
              Chưa có link {isTrailerMode ? "trailer" : "phim"} cho nội dung này.
            </div>
          ) : isDirectVideo ? (
            <video
              className="h-full w-full"
              controls
              autoPlay
              playsInline
              poster={movie?.thumbnailUrl}
              src={chosenUrl}
            />
          ) : trailerEmbedUrl ? (
            <iframe
              className="h-full w-full"
              src={trailerEmbedUrl}
              title={movie?.title || "Trailer"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-white text-lg gap-3">
              <p>Link này không hỗ trợ phát inline ổn định.</p>
              <a
                href={chosenUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded bg-white text-black"
              >
                Mở link nguồn
              </a>
            </div>
          )}
        </div>

        {/* Comment Section */}
        {movieId && <CommentSection movieId={movieId} />}
      </div>
    </div>
  );
};

export default WatchPage;
