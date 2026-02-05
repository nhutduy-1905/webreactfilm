import React, { useState } from 'react';
import { FaBillboard } from 'react-icons/fa';

export const Billboard: React.FC<{ movie: any }> = ({ movie }) => {
  return (
    <div className='relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden'>
      <img src={movie?.thumbnailUrl || '/placeholder.png'} alt='Billboard' className='w-full h-full object-cover' />
      <div className='absolute bottom-10 left-10'>
        <h1 className='text-4xl font-bold text-white mb-4'>{movie?.title}</h1>
        <p className='text-gray-300 max-w-lg'>{movie?.description}</p>
      </div>
    </div>
  );
};

export default Billboard;
