import React, { useState, useEffect } from 'react';
import { Table, Input, Tag, Button, Space, Avatar, message } from 'antd';
import { UserOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  favoriteIds: string[];
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/users?page=${pagination.page}&limit=${pagination.limit}&search=${search}`);
      setUsers(response.data.data || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Demo data
      setUsers([
        { id: '1', name: 'Admin User', email: 'admin@test.com', createdAt: new Date().toISOString(), favoriteIds: [] },
        { id: '2', name: 'Test User', email: 'test@test.com', createdAt: new Date().toISOString(), favoriteIds: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (pagination.page - 1) * pagination.limit + index + 1,
    },
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={record.image} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Yêu thích',
      dataIndex: 'favoriteIds',
      key: 'favoriteIds',
      render: (ids: string[]) => (
        <Tag color="blue">{ids?.length || 0} phim</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Quản lý người dùng</h1>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm người dùng..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page })),
            showSizeChanger: false,
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
