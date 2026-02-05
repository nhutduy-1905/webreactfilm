import React from 'react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className='min-h-screen bg-white'>
      <nav className='bg-gray-800 text-white p-4'>
        <h1 className='text-2xl font-bold'>Admin Panel</h1>
      </nav>
      <main className='p-8'>{children}</main>
    </div>
  );
};

export default AdminLayout;
