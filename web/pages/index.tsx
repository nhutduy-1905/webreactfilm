import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import Head from "next/head";
import type { NextPage, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { AUTH_REDIRECT, isSsrRequestAuthenticated } from "../libs/ssrAuth";

import { profileActions, type ProfileState } from "../store/profile";
import { movieActions, type movieState } from "../store/movies";
import { useAppDispatch } from "../store";

import useCurrentUser from "../hooks/useCurrentUser";
import useMovieList, { type MovieItem } from "../hooks/useMovieList";
import useFavorites from "../hooks/useFavorites";

import Navbar from "../components/Navbar";
import Billboard from "../components/Billboard";
import MovieList from "../components/MovieList";
import InfoModal from "../components/InfoModal";
import IntroN from "../components/IntroN";

const BRAND_INTRO_URL =
  process.env.NEXT_PUBLIC_BRAND_INTRO_URL || "https://youtu.be/GV3HUDMQ-F8?si=gQQSweVWrmLqX2Vd";
const parsedBrandIntroDurationMs = Number(
  process.env.NEXT_PUBLIC_BRAND_INTRO_DURATION_MS ?? process.env.NEXT_PUBLIC_INTRO_DURATION_MS
);
const INTRO_DURATION_MS = Number.isFinite(parsedBrandIntroDurationMs)
  ? Math.max(0, Math.floor(parsedBrandIntroDurationMs))
  : 4000;
type HomePageProps = {
  showIntroOnLoad: boolean;
};

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const isAuthenticated = await isSsrRequestAuthenticated(context);
  if (!isAuthenticated) {
    return AUTH_REDIRECT;
  }

  const introParam = context.query.intro;
  const showIntroOnLoad = introParam === "1" || (Array.isArray(introParam) && introParam.includes("1"));

  return { props: { showIntroOnLoad } };
}

const Home: NextPage<HomePageProps> = ({ showIntroOnLoad }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showIntro, setShowIntro] = useState(showIntroOnLoad);
  const [introResolved, setIntroResolved] = useState(showIntroOnLoad);
  const shouldFetchHomeData = introResolved && !showIntro;

  const { data: currentUser } = useCurrentUser(shouldFetchHomeData);
  const { data: moviesList = [], isLoading: moviesLoading, error: moviesError } = useMovieList(shouldFetchHomeData);
  const { data: favorites = [] } = useFavorites(shouldFetchHomeData);

  const toMovieState = (movie: MovieItem): movieState => ({
    id: String(movie.id ?? movie._id ?? ""),
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
    cast: Array.isArray(movie.cast) ? movie.cast : [],
    status: movie.status,
    ageRating: movie.ageRating,
    releaseDate: movie.releaseDate,
    imageUrl: movie.imageUrl,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    trailerUrl: movie.trailerUrl,
    tags: Array.isArray(movie.tags) ? movie.tags : [],
    subtitles: Array.isArray(movie.subtitles) ? movie.subtitles : [],
    categories: Array.isArray(movie.categories) ? movie.categories : [],
  });

  const movieStateList = useMemo<movieState[]>(
    () => moviesList.map(toMovieState).filter((movie) => Boolean(movie.id)),
    [moviesList]
  );

  useEffect(() => {
    if (currentUser?.id) {
      const profilePayload: ProfileState = {
        id: currentUser.id,
        createdAt: currentUser.createdAt,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified ?? null,
        favoriteIds: Array.isArray(currentUser.favoriteIds) ? currentUser.favoriteIds : [],
        image: currentUser.image ?? "",
        name: currentUser.name ?? "",
        updatedAt: currentUser.updatedAt,
      };
      dispatch(profileActions.updateProfile(profilePayload));
    }
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    if (movieStateList.length > 0) {
      dispatch(movieActions.updateMovieList(movieStateList));
    }
  }, [movieStateList, dispatch]);

  const hideIntro = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("nextflix:home_intro_seen", "1");
      }
    } catch {
      // Ignore sessionStorage errors.
    }

    setShowIntro(false);
    if (showIntroOnLoad) {
      router.replace("/", undefined, { shallow: true });
    }
  }, [router, showIntroOnLoad]);

  useIsomorphicLayoutEffect(() => {
    let shouldShowIntro = showIntroOnLoad;
    if (typeof window !== "undefined") {
      try {
        const navEntries = window.performance.getEntriesByType("navigation");
        const navEntry = navEntries[0] as PerformanceNavigationTiming | undefined;
        const navType = navEntry?.type;
        const isReload = navType === "reload";
        const isNavigate = navType === "navigate" || !navType;
        const hasShownIntro = window.sessionStorage.getItem("nextflix:home_intro_seen") === "1";
        const legacyNavigation = (window.performance as any).navigation;
        const legacyReload = legacyNavigation?.type === 1;

        if (isReload || legacyReload || (!hasShownIntro && isNavigate)) {
          shouldShowIntro = true;
        }
      } catch {
        // Ignore unsupported performance APIs.
      }
    }

    setShowIntro(shouldShowIntro);
    setIntroResolved(true);
  }, [showIntroOnLoad]);

  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(() => hideIntro(), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [hideIntro, showIntro]);

  if (!introResolved) {
    return <div className="w-screen h-screen bg-black" />;
  }

  if (showIntro) {
    return (
      <IntroN
        preferVideo
        videoUrl={BRAND_INTRO_URL}
        alt="Brand intro"
        onFinished={hideIntro}
        finishAfterMs={INTRO_DURATION_MS}
      />
    );
  }

  if (moviesLoading) {
    return <IntroN preferVideo videoUrl={BRAND_INTRO_URL} alt="Loading intro" />;
  }

  if (moviesError) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center px-6 text-center">
        Không kết nối được dữ liệu phim. Bạn kiểm tra backend hoặc API rồi tải lại trang.
      </div>
    );
  }

  if (!moviesLoading && moviesList.length === 0) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
        Không có phim nào để hiển thị.
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/images/favicon.png" />
      </Head>
      <InfoModal />
      <Navbar />
      <Billboard />
      <div className="pb-40">
        <MovieList title="Trending Now" data={moviesList} />
        <MovieList title="My List" data={favorites} />
      </div>
    </>
  );
};

export default Home;
