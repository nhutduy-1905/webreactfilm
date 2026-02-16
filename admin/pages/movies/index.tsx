import React, { useEffect, useState, useCallback } from 'react';
import { Table, Input, Select, Button, Space, Tag, Dropdown, Breadcrumb, message, Image } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import AdminLayout from '../../components/AdminLayout';
import { movieApi, Movie, PaginatedResponse } from '../../lib/api';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Nháp' },
  published: { color: 'green', label: 'Đang chiếu' },
  hidden: { color: 'red', label: 'Ẩn' },
};

const CATEGORIES = [
  'Hành động', 'Hài', 'Tình cảm', 'Kinh dị', 'Tâm linh', 'Tâm lý',
  'Khoa học viễn tưởng', 'Phiêu lưu', 'Hoạt hình', 'Gia đình',
  'Tội phạm', 'Bí ẩn', 'Lịch sử', 'Chiến tranh', 'Tiểu sử',
  'Chính kịch', 'Thể thao',
];

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  // Sync with URL query params
  useEffect(() => {
    if (router.query.status) {
      setStatusFilter(router.query.status as string);
    }
  }, [router.query.status]);

  const fetchMovies = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: pagination.limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const result = await movieApi.getAll(params);
      setMovies(result.data);
      setPagination(result.pagination);
    } catch (err) {
      message.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, pagination.limit]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await movieApi.updateStatus(id, status);
      message.success('Cập nhật trạng thái thành công');
      fetchMovies(pagination.page);
    } catch {
      message.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await movieApi.delete(id);
      message.success('Đã ẩn phim');
      fetchMovies(pagination.page);
    } catch {
      message.error('Lỗi xóa phim');
    }
  };

  const getActions = (record: Movie): MenuProps['items'] => [
    { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa', onClick: () => router.push(`/movies/${record.id}`) },
    ...(record.status !== 'published'
      ? [{ key: 'publish', icon: <EyeOutlined />, label: 'Xuất bản', onClick: () => handleStatusChange(record.id, 'published') }]
      : []),
    ...(record.status !== 'draft'
      ? [{ key: 'draft', icon: <FileTextOutlined />, label: 'Chuyển nháp', onClick: () => handleStatusChange(record.id, 'draft') }]
      : []),
    ...(record.status !== 'hidden'
      ? [{ key: 'hide', icon: <EyeInvisibleOutlined />, label: 'Ẩn', onClick: () => handleStatusChange(record.id, 'hidden') }]
      : []),
    { type: 'divider' as const },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(record.id) },
  ];

  const columns: ColumnsType<Movie> = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 60,
      render: (url: string, record: Movie) => {
        const imgSrc = url || record.posterUrl || record.thumbnailUrl;
        return (
          <Image src={imgSrc} alt="" width={40} height={56} style={{ objectFit: 'cover', borderRadius: 4 }} fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjU2IiBmaWxsPSIjMjIyIi8+PHRleHQgeD0iMjAiIHk9IjI4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjEwIj5OL0E8L3RleHQ+PC9zdmc+" />
        );
      },
    },
    { title: 'Mã phim', dataIndex: 'code', key: 'code', width: 100 },
    {
      title: 'Tên phim',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Movie) => (
        <a onClick={() => router.push(`/movies/${record.id}`)} style={{ fontWeight: 500 }}>{text}</a>
      ),
    },
    { title: 'Đạo diễn', dataIndex: 'director', key: 'director', width: 150, ellipsis: true },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (v: number) => v ? `${v} phút` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const s = STATUS_MAP[status] || { color: 'default', label: status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_: any, record: Movie) => (
        <Dropdown menu={{ items: getActions(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const breadcrumb = (
    <Breadcrumb items={[
      { title: 'Trang chủ' },
      { title: 'Quản lý phim' },
      { title: statusFilter ? STATUS_MAP[statusFilter]?.label || 'Tất cả' : 'Tất cả phim' },
    ]} />
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Input
              placeholder="Tìm kiếm phim..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => fetchMovies(1)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={(s) => setStatusFilter(s)}
              allowClear
              style={{ width: 140 }}
            >
              <Select.Option value="draft">Nháp</Select.Option>
              <Select.Option value="published">Đang chiếu</Select.Option>
              <Select.Option value="hidden">Ẩn</Select.Option>
            </Select>
            <Select
              placeholder="Thể loại"
              value={categoryFilter}
              onChange={(c) => setCategoryFilter(c)}
              allowClear
              style={{ width: 180 }}
            >
              {CATEGORIES.map((c) => (
                <Select.Option key={c} value={c}>{c}</Select.Option>
              ))}
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/movies/create')}>
            Thêm phim
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={movies}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.limit,
            showTotal: (total) => `Tổng ${total} phim`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => {
              setPagination((p) => ({ ...p, limit: pageSize || 20 }));
              fetchMovies(page);
            },
          }}
          onRow={(record) => ({
            onDoubleClick: () => router.push(`/movies/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 900 }}
        />
      </div>
    </AdminLayout>
  );
}
