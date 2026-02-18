import React, { useMemo } from 'react';
import { GetServerSidePropsContext } from 'next';
import useMovieList from "../hooks/useMovieList";
import Navbar from '../components/Navbar';
import MovieList from '../components/MovieList';
import InfoModal from '../components/InfoModal';
import { AUTH_REDIRECT, isSsrRequestAuthenticated } from "../libs/ssrAuth";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const isAuthenticated = await isSsrRequestAuthenticated(context);
  if (!isAuthenticated) {
    return AUTH_REDIRECT;
  }

  return { props: {} };
}

const NewPage: React.FC = () => {
  const { data: moviesList = [] } = useMovieList();

  // Filter for new movies (last 30 days)
  const filteredMovies = useMemo(() => {
    if (!moviesList || moviesList.length === 0) return [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return moviesList.filter((m: any) => {
      const createdAt = new Date(m.createdAt);
      return createdAt >= thirtyDaysAgo;
    });
  }, [moviesList]);

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <InfoModal />
      <div className="pt-24 pb-40">
        <MovieList title="Mới & Phổ Biến" data={filteredMovies} />
      </div>
    </div>
  );
};

export default NewPage;
