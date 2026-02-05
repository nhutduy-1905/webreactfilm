import React from 'react';

export const ErrorFallback: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className='w-full h-screen bg-gray-900 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-red-600 mb-4'>Lỗi</h1>
        <p className='text-white text-lg'>{error || 'Đã xảy ra lỗi'}</p>
      </div>
    </div>
  );
};

export default ErrorFallback;
