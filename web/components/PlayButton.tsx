import React from 'react';
import { FaPlay, FaHeart, FaShareAlt } from 'react-icons/fa';

export const PlayButton: React.FC<{ movieId: string }> = ({ movieId }) => {
  return (
    <button className='bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2'>
      <FaPlay /> Xem Ngay
    </button>
  );
};

export default PlayButton;
