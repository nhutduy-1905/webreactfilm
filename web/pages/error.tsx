import React from 'react';

export default function Error() {
  return (
    <div className='w-full h-screen bg-gray-900 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-red-600 mb-4'>404</h1>
        <p className='text-2xl text-white'>Trang không tìm thấy</p>
      </div>
    </div>
  );
}
