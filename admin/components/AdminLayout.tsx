import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  VideoCameraOutlined,
  AppstoreOutlined,
  TeamOutlined,
  PictureOutlined,
  FileTextOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, breadcrumb }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const getSelectedKey = () => {
    const path = router.asPath;
    if (path.includes('status=draft')) return 'movies-draft';
    if (path.includes('status=published')) return 'movies-published';
    if (path.includes('status=hidden')) return 'movies-hidden';
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/actors')) return 'actors';
    if (path.startsWith('/banners')) return 'banners';
    if (path.startsWith('/movies')) return 'movies-all';
    return 'movies-all';
  };

  const menuItems = [
    {
      key: 'movies-group',
      icon: <VideoCameraOutlined />,
      label: 'Quản lý phim',
      children: [
        { key: 'movies-all', icon: <UnorderedListOutlined />, label: 'Tất cả phim', onClick: () => router.push('/movies') },
        { key: 'movies-draft', icon: <FileTextOutlined />, label: 'Phim nháp', onClick: () => router.push('/movies?status=draft') },
        { key: 'movies-published', icon: <EyeOutlined />, label: 'Đang chiếu', onClick: () => router.push('/movies?status=published') },
        { key: 'movies-hidden', icon: <EyeInvisibleOutlined />, label: 'Ẩn', onClick: () => router.push('/movies?status=hidden') },
      ],
    },
    { key: 'categories', icon: <AppstoreOutlined />, label: 'Thể loại', onClick: () => router.push('/categories') },
    { key: 'actors', icon: <TeamOutlined />, label: 'Diễn viên', onClick: () => router.push('/actors') },
    { key: 'banners', icon: <PictureOutlined />, label: 'Banner', onClick: () => router.push('/banners') },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ color: '#e50914', margin: 0, fontWeight: 700 }}>
            {collapsed ? 'N' : 'NEXTFLIX'}
          </Title>
          {!collapsed && (
            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Admin Panel</div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          defaultOpenKeys={['movies-group']}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          {breadcrumb}
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
