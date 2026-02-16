import React, { useMemo } from 'react';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../libs/authOptions";
import useMovieList from "../hooks/useMovieList";
import Navbar from '../components/Navbar';
import MovieList from '../components/MovieList';
import InfoModal from '../components/InfoModal';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      }
    }
  }
  return { props: {} };
}

const FilmsPage: React.FC = () => {
  const { data: moviesList = [] } = useMovieList();

  // Filter for standalone films (not series)
  // Films are typically shorter movies, comedies, action films, etc.
  const filteredMovies = useMemo(() => {
    if (!moviesList || moviesList.length === 0) return [];
    return moviesList.filter((m: any) => {
      // Exclude explicit Series category
      if (m.categories?.includes('Series')) return false;
      // Exclude long-running content (likely series)
      const duration = parseInt(m.duration) || 0;
      if (duration > 150) return false;
      // Exclude dramatic/psychological content
      if (m.categories?.includes('Chính kịch') && duration > 120) return false;
      return true;
    });
  }, [moviesList]);

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <InfoModal />
      <div className="pt-24 pb-40">
        <MovieList title="Phim Lẻ" data={filteredMovies} />
      </div>
    </div>
  );
};

export default FilmsPage;
