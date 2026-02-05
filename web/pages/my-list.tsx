import React from 'react';

export default function MyList() {
  return (
    <div className='w-full bg-gray-900 min-h-screen p-8'>
      <h1 className='text-4xl font-bold text-white mb-8'>Danh Sách Yêu Thích</h1>
      <div className='bg-gray-800 p-8 rounded-lg text-center'>
        <p className='text-gray-400 text-lg'>Chưa có phim yêu thích nào</p>
      </div>
    </div>
  );
}
