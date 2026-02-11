import React from 'react';
import { Breadcrumb, Card, Typography, Tag, Space, Table, Button } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';

const { Title, Text } = Typography;

const CATEGORIES = [
  'Hành động', 'Hài', 'Tình cảm', 'Kinh dị', 'Tâm linh', 'Tâm lý',
  'Khoa học viễn tưởng', 'Phiêu lưu', 'Hoạt hình', 'Gia đình',
  'Tội phạm', 'Bí ẩn', 'Lịch sử', 'Chiến tranh', 'Tiểu sử',
  'Chính kịch', 'Thể thao', 'Âm nhạc', 'Tài liệu',
];

export default function CategoriesPage() {
  const breadcrumb = (
    <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Thể loại' }]} />
  );

  const dataSource = CATEGORIES.map((name, i) => ({
    key: i,
    name,
    slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '-'),
    count: Math.floor(Math.random() * 10) + 1,
  }));

  const columns = [
    { title: '#', key: 'index', width: 50, render: (_: any, __: any, i: number) => i + 1 },
    { title: 'Tên thể loại', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (t: string) => <Tag>{t}</Tag> },
    { title: 'Số phim', dataIndex: 'count', key: 'count', width: 100 },
  ];

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}><AppstoreOutlined /> Quản lý thể loại</Title>
        </div>
        <Card>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            Danh sách các thể loại phim hiện có trong hệ thống. Tính năng CRUD thể loại sẽ được phát triển ở Phase 2.
          </Text>
          <Table dataSource={dataSource} columns={columns} pagination={false} size="middle" />
        </Card>
      </div>
    </AdminLayout>
  );
}
