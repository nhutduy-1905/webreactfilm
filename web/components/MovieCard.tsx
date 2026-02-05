import React from 'react';

export const MovieCard: React.FC<{ movie: any }> = ({ movie }) => {
  return (
    <div className='bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition cursor-pointer'>
      <img src={movie.thumbnailUrl || '/placeholder.png'} alt={movie.title} className='w-full h-64 object-cover' />
      <div className='p-4'>
        <h3 className='text-white font-bold truncate'>{movie.title}</h3>
        <p className='text-gray-400 text-sm'>{movie.duration} phút</p>
      </div>
    </div>
  );
};

export default MovieCard;
