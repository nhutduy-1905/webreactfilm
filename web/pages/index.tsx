import React, { useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import type { NextPage, GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../libs/authOptions";

import { profileActions } from "../store/profile";
import { movieActions } from "../store/movies";
import { useAppDispatch } from "../store";

import useCurrentUser from "../hooks/useCurrentUser";
import useMovieList from "../hooks/useMovieList";
import useFavorites from "../hooks/useFavorites";

import Navbar from "../components/Navbar";
import Billboard from "../components/Billboard";
import MovieList from "../components/MovieList";
import InfoModal from "../components/InfoModal";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

const Home: NextPage = () => {
  const dispatch = useAppDispatch();

  const { data: currentUser } = useCurrentUser();
  const { data: moviesList = [], isLoading: moviesLoading } = useMovieList();
  const { data: favorites = [] } = useFavorites();

  // Use useMemo to stabilize moviesList.length
  const moviesCount = useMemo(() => moviesList.length, [moviesList]);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(profileActions.updateProfile(currentUser as any));
    }
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    if (moviesCount > 0) {
      dispatch(movieActions.updateMovieList(moviesList as any));
    }
  }, [moviesCount, moviesList, dispatch]);

  if (moviesLoading) {
    return (
      <div className="relative w-[100vw] h-[100vh] bg-black">
        <img
          className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]"
          src="/images/loading.gif"
          alt="Loading spinner"
        />
      </div>
    );
  }

  // Load xong mà không có phim thì hiện message, KHÔNG quay mãi
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
