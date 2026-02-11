import React, { useEffect, useState } from 'react';
import { Breadcrumb, message, Spin } from 'antd';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import MovieForm from '../../components/MovieForm';
import { movieApi, Movie } from '../../lib/api';

export default function EditMoviePage() {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    movieApi.getById(id as string)
      .then(setMovie)
      .catch(() => {
        message.error('Không tìm thấy phim');
        router.push('/movies');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    setSaving(true);
    try {
      await movieApi.update(id as string, values);
      message.success('Cập nhật phim thành công!');
      router.push('/movies');
    } catch (err: any) {
      message.error(err?.response?.data?.error || 'Lỗi cập nhật phim');
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = (
    <Breadcrumb items={[
      { title: 'Trang chủ' },
      { title: <a onClick={() => router.push('/movies')}>Quản lý phim</a> },
      { title: movie?.title || 'Chỉnh sửa phim' },
    ]} />
  );

  if (loading) {
    return (
      <AdminLayout breadcrumb={breadcrumb}>
        <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <MovieForm initialValues={movie || undefined} onSubmit={handleSubmit} loading={saving} />
    </AdminLayout>
  );
}
