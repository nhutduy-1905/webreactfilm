import React, { useState } from 'react';

export default function AdminDashboard() {
  const [movies, setMovies] = useState([
    { id: 1, title: 'Phim 1', duration: 120, description: 'Mô tả phim 1' },
    { id: 2, title: 'Phim 2', duration: 140, description: 'Mô tả phim 2' },
  ]);

  return (
    <div className='w-full min-h-screen bg-white p-8'>
      <h1 className='text-4xl font-bold text-gray-900 mb-8'>Dashboard Admin</h1>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <div className='flex justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Quản Lý Phim</h2>
          <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'>
            Thêm Phim
          </button>
        </div>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-200'>
              <th className='border p-3 text-left'>Tiêu Đề</th>
              <th className='border p-3 text-left'>Thời Lượng</th>
              <th className='border p-3 text-left'>Mô Tả</th>
              <th className='border p-3 text-left'>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id} className='border hover:bg-gray-100'>
                <td className='border p-3'>{movie.title}</td>
                <td className='border p-3'>{movie.duration} phút</td>
                <td className='border p-3'>{movie.description}</td>
                <td className='border p-3'>
                  <button className='bg-yellow-500 text-white px-3 py-1 rounded mr-2'>
                    Sửa
                  </button>
                  <button className='bg-red-600 text-white px-3 py-1 rounded'>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
