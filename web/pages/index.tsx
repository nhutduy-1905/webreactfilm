import React from 'react';

export default function Home() {
  return (
    <div className='w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-white mb-6'>Film Streaming</h1>
        <p className='text-xl text-gray-300 mb-8'>Xem phim yêu thích của bạn</p>
        <div className='space-x-4'>
          <button className='bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold'>
            Xem Ngay
          </button>
          <button className='bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold'>
            Đăng Nhập
          </button>
        </div>
      </div>
    </div>
  );
}
