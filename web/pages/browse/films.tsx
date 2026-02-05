import React, { useState, useEffect } from 'react';

export default function Films() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(\\/movies\);
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className='w-full h-screen bg-gray-900 flex items-center justify-center'>
        <p className='text-white text-2xl'>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className='w-full bg-gray-900 min-h-screen p-8'>
      <h1 className='text-4xl font-bold text-white mb-8'>Danh Sách Phim</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {movies.map((movie: any) => (
          <div key={movie.id} className='bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition'>
            <img src={movie.thumbnailUrl} alt={movie.title} className='w-full h-64 object-cover' />
            <div className='p-4'>
              <h2 className='text-white font-bold truncate'>{movie.title}</h2>
              <p className='text-gray-400 text-sm'>{movie.duration} phút</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
