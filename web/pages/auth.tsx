import React, { useState } from 'react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const data = isLogin ? { email, password } : { email, password, name };
    
    try {
      const response = await fetch(\\\\, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.token) {
        localStorage.setItem('token', result.token);
        window.location.href = '/browse/films';
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className='w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center'>
      <div className='w-full max-w-md bg-gray-800 p-8 rounded-lg'>
        <h2 className='text-3xl font-bold text-white mb-6 text-center'>
          {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
        </h2>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          {!isLogin && (
            <input
              type='text'
              placeholder='Tên của bạn'
              className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          
          <input
            type='email'
            placeholder='Email'
            className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type='password'
            placeholder='Mật khẩu'
            className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button
            type='submit'
            className='w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg'
          >
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>
        
        <p className='text-gray-400 text-center mt-4'>
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className='text-red-500 hover:text-red-400 font-bold'
          >
            {isLogin ? 'Đăng Ký' : 'Đăng Nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}
