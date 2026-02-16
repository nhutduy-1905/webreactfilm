import React from "react";
import { useRouter } from "next/router";
import { AiOutlineClose } from "react-icons/ai";
import { BsFillPlayFill } from "react-icons/bs";
import FavoriteButton from "./FavoriteButton";

import { movieActions } from "../store/movies";
import { useAppDispatch, useAppSelector } from "../store/index";
import { movieState } from "../store/movies";

interface InfoModalProps {
  onClose?: () => void;
}

const InfoModal: React.FC<InfoModalProps> = () => {
  const movies = useAppSelector((state) => state.movies);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isVisible = movies.showModal;
  if (!isVisible) return null;

  const movieArray = movies.movie;
  // Handle both array and single object
  const data: movieState = Array.isArray(movieArray) ? movieArray[0] : movieArray;
  if (!data || !data.id) return null;

  const handleClose = () => {
    dispatch(movieActions.hideModal());
  };

  const redirectToWatchMovie = () => {
    if (!data?.id) return;
    dispatch(movieActions.hideModal());
    router.push(`/watch/${data.id}?mode=movie`);
  };

  const redirectToWatchTrailer = () => {
    if (!data?.id) return;
    dispatch(movieActions.hideModal());
    router.push(`/watch/${data.id}?mode=trailer`);
  };

  const releaseYear = data?.releaseDate
    ? new Date(data.releaseDate).getFullYear()
    : "----";

  const categories = Array.isArray(data?.categories)
    ? data.categories.join(", ")
    : data?.genre || "Đang cập nhật";

  const castText = Array.isArray(data?.cast)
    ? data.cast.join(", ")
    : "Đang cập nhật";

  const subtitleText = Array.isArray(data?.subtitles)
    ? data.subtitles.join(", ")
    : "Đang cập nhật";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 md:p-6">
      <div className="relative w-full max-w-6xl rounded-xl overflow-hidden bg-zinc-900 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black flex items-center justify-center"
        >
          <AiOutlineClose className="text-white" size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 lg:col-span-3 bg-black">
            <img
              src={data?.thumbnailUrl || "/images/placeholder.png"}
              alt={data?.title || "Poster"}
              className="w-full h-full object-cover md:min-h-[560px]"
            />
          </div>

          <div className="md:col-span-8 lg:col-span-9 p-5 md:p-7 text-white">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-2">
              {data?.title || "Đang cập nhật"}
            </h2>

            <div className="text-zinc-300 text-sm md:text-lg mb-4">
              <span>{data?.studio || "Đang cập nhật"}</span>
              <span className="mx-2">•</span>
              <span>{releaseYear}</span>
              <span className="mx-2">•</span>
              <span>{data?.duration || 0} phút</span>
            </div>

            {!!data?.description && (
              <p className="text-zinc-200 leading-7 text-sm md:text-lg mb-5">
                {data.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm md:text-base">
              <div>
                <p className="text-zinc-400">Đạo diễn</p>
                <p className="font-medium">{data?.director || "Đang cập nhật"}</p>
              </div>

              <div>
                <p className="text-zinc-400">Thể loại</p>
                <p className="font-medium">{categories}</p>
              </div>

              <div>
                <p className="text-zinc-400">Diễn viên</p>
                <p className="font-medium">{castText}</p>
              </div>

              <div>
                <p className="text-zinc-400">Phụ đề</p>
                <p className="font-medium">{subtitleText}</p>
              </div>

              <div>
                <p className="text-zinc-400">Phân loại tuổi</p>
                <p className="font-medium">{data?.ageRating || "Đang cập nhật"}</p>
              </div>

              <div>
                <p className="text-zinc-400">Ngày phát hành</p>
                <p className="font-medium">
                  {data?.releaseDate
                    ? new Date(data.releaseDate).toLocaleDateString("vi-VN")
                    : "Đang cập nhật"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <button
                onClick={redirectToWatchMovie}
                className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 flex items-center gap-2"
              >
                <BsFillPlayFill size={20} />
                Xem phim
              </button>

              <button
                onClick={redirectToWatchTrailer}
                className="px-5 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700"
              >
                Xem trailer
              </button>

              <div className="ml-1">
                <FavoriteButton movieId={data?.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
