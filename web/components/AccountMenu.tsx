import React from 'react';
import { FaUser } from 'react-icons/fa';

export const AccountMenu: React.FC<{ user?: any; onLogout?: () => void }> = ({ user, onLogout }) => {
  return (
    <div className='flex items-center gap-4'>
      <FaUser className='text-gray-300' />
      <span className='text-white'>{user?.name || 'User'}</span>
      <button onClick={onLogout} className='text-white hover:text-gray-300'>
        Đăng Xuất
      </button>
    </div>
  );
};

export default AccountMenu;
