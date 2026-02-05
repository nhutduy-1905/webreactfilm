import React from 'react';

export default function Profiles() {
  return (
    <div className='w-full bg-gray-900 min-h-screen p-8'>
      <h1 className='text-4xl font-bold text-white'>Chọn Hồ Sơ</h1>
      <div className='grid grid-cols-4 gap-6 mt-8'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='flex flex-col items-center cursor-pointer hover:scale-110 transition'>
            <div className='w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4'></div>
            <p className='text-white text-lg'>Hồ sơ {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
