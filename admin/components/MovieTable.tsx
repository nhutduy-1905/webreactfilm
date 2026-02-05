import React from 'react';

export const MovieTable: React.FC<{ movies: any[] }> = ({ movies }) => {
  return (
    <table className='w-full border-collapse'>
      <thead>
        <tr className='bg-gray-200'>
          <th className='border p-3'>Tiêu Đề</th>
          <th className='border p-3'>Thể Loại</th>
          <th className='border p-3'>Thời Lượng</th>
          <th className='border p-3'>Hành Động</th>
        </tr>
      </thead>
      <tbody>
        {movies.map((m) => (
          <tr key={m.id} className='border hover:bg-gray-100'>
            <td className='border p-3'>{m.title}</td>
            <td className='border p-3'>{m.genre?.name || 'N/A'}</td>
            <td className='border p-3'>{m.duration} phút</td>
            <td className='border p-3 space-x-2'>
              <button className='bg-blue-600 text-white px-3 py-1 rounded'>Sửa</button>
              <button className='bg-red-600 text-white px-3 py-1 rounded'>Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MovieTable;
