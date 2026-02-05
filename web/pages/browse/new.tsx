import React from 'react';

export default function NewPage() {
  return (
    <div className='w-full bg-gray-900 min-h-screen p-8'>
      <h1 className='text-white text-4xl mb-8'>Phim Mới</h1>
      <div className='grid grid-cols-4 gap-6'>
        {Array(12).fill(0).map((_, i) => (
          <div key={i} className='bg-gray-800 rounded-lg h-64 animate-pulse'></div>
        ))}
      </div>
    </div>
  );
}
