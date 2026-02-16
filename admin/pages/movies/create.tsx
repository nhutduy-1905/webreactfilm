import React, { useState } from 'react';
import { Breadcrumb, message } from 'antd';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import MovieForm from '../../components/MovieForm';
import { movieApi } from '../../lib/api';

export default function CreateMoviePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await movieApi.create(values);
      message.success('Tạo phim thành công!');
      router.push('/movies');
    } catch (err: any) {
      message.error(err?.response?.data?.error || 'Lỗi tạo phim');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumb = (
    <Breadcrumb items={[
      { title: 'Trang chủ' },
      { title: <a onClick={() => router.push('/movies')}>Quản lý phim</a> },
      { title: 'Thêm phim mới' },
    ]} />
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <MovieForm onSubmit={handleSubmit} loading={loading} />
    </AdminLayout>
  );
}
