import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className='fixed w-full bg-gradient-to-b from-black via-black to-transparent z-40 p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-red-600 text-3xl font-bold'>NetFilm</h1>
        <div className='space-x-6'>
          <a href='/browse/films' className='text-white hover:text-gray-300'>Phim</a>
          <a href='/my-list' className='text-white hover:text-gray-300'>Danh Sách Của Tôi</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
