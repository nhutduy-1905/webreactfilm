import React from 'react';
import { Breadcrumb, Card, Typography, Table, Tag } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';

const { Title, Text } = Typography;

const SAMPLE_ACTORS = [
  { name: 'Trấn Thành', movies: 5 },
  { name: 'Lý Hải', movies: 3 },
  { name: 'Trường Giang', movies: 4 },
  { name: 'Ninh Dương Lan Ngọc', movies: 3 },
  { name: 'Phương Anh Đào', movies: 2 },
  { name: 'Tuấn Trần', movies: 2 },
  { name: 'Kiều Minh Tuấn', movies: 4 },
  { name: 'Thu Trang', movies: 3 },
  { name: 'Hồng Đào', movies: 2 },
  { name: 'Thanh Hằng', movies: 2 },
];

export default function ActorsPage() {
  const breadcrumb = (
    <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Diễn viên' }]} />
  );

  const columns = [
    { title: '#', key: 'index', width: 50, render: (_: any, __: any, i: number) => i + 1 },
    { title: 'Tên diễn viên', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Số phim tham gia', dataIndex: 'movies', key: 'movies', width: 150, render: (n: number) => <Tag color="blue">{n} phim</Tag> },
  ];

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}><TeamOutlined /> Quản lý diễn viên</Title>
        </div>
        <Card>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            Danh sách diễn viên được thu thập từ dữ liệu phim. Tính năng CRUD diễn viên sẽ được phát triển ở Phase 2.
          </Text>
          <Table
            dataSource={SAMPLE_ACTORS.map((a, i) => ({ key: i, ...a }))}
            columns={columns}
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
