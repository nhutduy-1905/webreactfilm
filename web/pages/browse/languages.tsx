import React, { useState, useEffect } from 'react';

export default function LanguagesPage() {
  return (
    <div className='w-full bg-gray-900 min-h-screen p-8'>
      <h1 className='text-white text-4xl mb-8'>Ngôn Ngữ</h1>
      <div className='grid grid-cols-2 gap-4'>
        {['English', 'Tiếng Việt', 'Español', 'Français'].map((lang) => (
          <button key={lang} className='bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg'>
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
}
