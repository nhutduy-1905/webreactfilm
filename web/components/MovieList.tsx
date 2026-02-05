import React from 'react';

export const MovieList: React.FC<{ movies: any[] }> = ({ movies }) => {
  return (
    <div className='grid grid-cols-4 gap-6'>
      {movies.map((movie) => (
        <div key={movie.id} className='bg-gray-800 rounded-lg overflow-hidden'>
          <img src={movie.thumbnailUrl} alt={movie.title} className='w-full h-64 object-cover' />
          <div className='p-4'>
            <h3 className='text-white font-bold'>{movie.title}</h3>
            <p className='text-gray-400 text-sm'>{movie.duration} phút</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieList;
