import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export const SearchBar: React.FC = () => {
  const [value, setValue] = useState('');
  return (
    <div className='flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg'>
      <FaSearch className='text-gray-500' />
      <input
        type='text'
        placeholder='Tìm phim...'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='bg-transparent text-white outline-none flex-1'
      />
    </div>
  );
};

export default SearchBar;
