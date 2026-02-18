import React from "react";
import { GetServerSidePropsContext } from "next";
import { AUTH_REDIRECT, isSsrRequestAuthenticated } from "../libs/ssrAuth";
import useFavorites from "../hooks/useFavorites";
import Navbar from "../components/Navbar";
import MovieList from "../components/MovieList";
import InfoModal from "../components/InfoModal";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const isAuthenticated = await isSsrRequestAuthenticated(context);
  if (!isAuthenticated) {
    return AUTH_REDIRECT;
  }

  return { props: {} };
}

const MyListPage: React.FC = () => {
  const { data: favorites = [] } = useFavorites();
  const favoriteList = Array.isArray(favorites) ? favorites : [];

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <InfoModal />
      <div className="pt-24 pb-40">
        {favoriteList.length > 0 ? (
          <MovieList title="Danh Sách Của Tôi" data={favoriteList} />
        ) : (
          <p className="px-4 md:px-12 text-zinc-400 text-base md:text-lg">
            Bạn chưa thêm phim nào vào My List.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyListPage;
