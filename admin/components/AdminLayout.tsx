import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Layout,
  Menu,
  Input,
  Badge,
  Avatar,
  Dropdown,
  Typography,
  Popover,
  Button,
  Empty,
  Spin,
} from 'antd';
import {
  VideoCameraOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UnorderedListOutlined,
  CommentOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import axios from 'axios';
import { movieApi } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  href: string;
  type: 'comment' | 'movie' | 'system';
}

const READ_NOTIFICATION_STORAGE_KEY = 'nextflix.admin.readNotifications';

const truncateText = (text: string, max = 90) => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const getTimeAgo = (dateLike: string) => {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, breadcrumb }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [quickSearch, setQuickSearch] = useState('');

  const getSelectedKey = () => {
    const path = router.asPath;
    if (path === '/' || path === '/index') return 'dashboard';
    if (path.includes('comments')) return 'comments';
    if (path.includes('users')) return 'users';
    if (path.includes('analytics') || path.includes('reports')) return 'analytics';
    if (path.includes('settings')) return 'settings';
    if (path.includes('status=draft')) return 'movies-draft';
    if (path.includes('status=published')) return 'movies-published';
    if (path.includes('status=hidden')) return 'movies-hidden';
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/actors')) return 'actors';
    if (path.startsWith('/banners')) return 'banners';
    if (path.startsWith('/movies')) return 'movies-all';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/'),
    },
    {
      key: 'movies-group',
      icon: <VideoCameraOutlined />,
      label: 'Quan ly phim',
      children: [
        { key: 'movies-all', icon: <UnorderedListOutlined />, label: 'Tat ca phim', onClick: () => router.push('/movies') },
        { key: 'movies-draft', icon: <FileTextOutlined />, label: 'Phim nhap', onClick: () => router.push('/movies?status=draft') },
        { key: 'movies-published', icon: <EyeOutlined />, label: 'Dang chieu', onClick: () => router.push('/movies?status=published') },
        { key: 'movies-hidden', icon: <EyeInvisibleOutlined />, label: 'An', onClick: () => router.push('/movies?status=hidden') },
      ],
    },
    { key: 'comments', icon: <CommentOutlined />, label: 'Binh luan', onClick: () => router.push('/comments') },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'Thong ke', onClick: () => router.push('/analytics') },
    { key: 'users', icon: <TeamOutlined />, label: 'Nguoi dung', onClick: () => router.push('/users') },
    { type: 'divider' as const },
    { key: 'categories', icon: <AppstoreOutlined />, label: 'The loai', onClick: () => router.push('/categories') },
    { key: 'actors', icon: <UserOutlined />, label: 'Dien vien', onClick: () => router.push('/actors') },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Ho so' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cai dat' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Dang xuat', danger: true },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(READ_NOTIFICATION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setReadNotificationIds(parsed.filter((id) => typeof id === 'string'));
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        READ_NOTIFICATION_STORAGE_KEY,
        JSON.stringify(readNotificationIds.slice(-300))
      );
    } catch {
      // ignore local storage error
    }
  }, [readNotificationIds]);

  useEffect(() => {
    const querySearch = typeof router.query.search === 'string' ? router.query.search : '';
    setQuickSearch(querySearch);
  }, [router.query.search]);

  const handleQuickSearch = useCallback((value: string) => {
    const keyword = value.trim();
    router.push({
      pathname: '/movies',
      query: {
        status: 'all',
        ...(keyword ? { search: keyword } : {}),
      },
    });
  }, [router]);

  const fetchNotifications = useCallback(async () => {
      setNotificationLoading(true);
      try {
        const [pendingCommentsRes, draftMoviesRes, hiddenMoviesRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/comments/admin`, { params: { page: 1, limit: 6, status: 'pending' } }),
        movieApi.getAll({ page: 1, limit: 1, status: 'draft' }),
        movieApi.getAll({ page: 1, limit: 1, status: 'hidden' }),
      ]);

      const nextNotifications: AdminNotification[] = [];
      const nowIso = new Date().toISOString();

      if (pendingCommentsRes.status === 'fulfilled') {
        const payload = pendingCommentsRes.value.data || {};
        const comments = Array.isArray(payload.comments) ? payload.comments : [];
        const pendingTotal = payload?.stats?.pending ?? comments.length;

        comments.forEach((comment: any) => {
          nextNotifications.push({
            id: `comment-${comment.id}`,
            title: 'Comment pending review',
            message: `${comment.userName || 'User'}: "${truncateText(comment.content || '', 72)}"`,
            createdAt: comment.createdAt || nowIso,
            href: '/comments',
            type: 'comment',
          });
        });

        if (pendingTotal > comments.length) {
          nextNotifications.push({
            id: `pending-comments-summary-${pendingTotal}`,
            title: `${pendingTotal} comments are waiting`,
            message: 'Open comments page to review and moderate quickly.',
            createdAt: nowIso,
            href: '/comments',
            type: 'comment',
          });
        }
      }

      if (draftMoviesRes.status === 'fulfilled') {
        const draftTotal = draftMoviesRes.value?.pagination?.total ?? 0;
        if (draftTotal > 0) {
          nextNotifications.push({
            id: `draft-movies-summary-${draftTotal}`,
            title: `${draftTotal} draft movies`,
            message: 'Review and publish these movies to show on user website.',
            createdAt: nowIso,
            href: '/movies?status=draft',
            type: 'movie',
          });
        }
      }

      if (hiddenMoviesRes.status === 'fulfilled') {
        const hiddenTotal = hiddenMoviesRes.value?.pagination?.total ?? 0;
        if (hiddenTotal > 0) {
          nextNotifications.push({
            id: `hidden-movies-summary-${hiddenTotal}`,
            title: `${hiddenTotal} hidden movies`,
            message: 'You can review hidden movies and restore visibility if needed.',
            createdAt: nowIso,
            href: '/movies?status=hidden',
            type: 'movie',
          });
        }
      }

      nextNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(nextNotifications.slice(0, 12));
    } catch {
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !readNotificationIds.includes(n.id)).length;
  }, [notifications, readNotificationIds]);

  const markNotificationAsRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setReadNotificationIds((prev) => Array.from(new Set([...prev, ...notifications.map((n) => n.id)])));
  }, [notifications]);

  const handleNotificationClick = useCallback((notification: AdminNotification) => {
    markNotificationAsRead(notification.id);
    setNotificationOpen(false);
    if (notification.href) router.push(notification.href);
  }, [markNotificationAsRead, router]);

  const notificationContent = useMemo(() => (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 600 }}>Notifications</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <Button type="link" size="small" onClick={() => fetchNotifications()}>
            Refresh
          </Button>
          <Button type="link" size="small" onClick={markAllNotificationsAsRead} disabled={notifications.length === 0}>
            Mark all read
          </Button>
        </div>
      </div>

      <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
        {notificationLoading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No new notifications" />
        ) : (
          notifications.map((notification) => {
            const isRead = readNotificationIds.includes(notification.id);
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  background: isRead ? '#fff' : '#f6faff',
                  padding: 10,
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#1f1f1f' }}>{notification.title}</span>
                  <span style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: '#666', lineHeight: 1.45 }}>
                  {notification.message}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  ), [
    fetchNotifications,
    handleNotificationClick,
    markAllNotificationsAsRead,
    notificationLoading,
    notifications,
    readNotificationIds,
  ]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Fixed Left Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={260}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <div style={{ padding: '20px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* Main Layout with fixed sidebar */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        {/* Top Bar */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          {/* Left: Toggle button + Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer', display: 'flex' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Search
              placeholder="Tim kiem nhanh..."
              style={{ width: 280 }}
              allowClear
              value={quickSearch}
              onChange={(event) => setQuickSearch(event.target.value)}
              onSearch={handleQuickSearch}
            />
          </div>

          {/* Right: Notifications + User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Popover
              trigger="click"
              placement="bottomRight"
              open={notificationOpen}
              onOpenChange={(open) => {
                setNotificationOpen(open);
                if (open) fetchNotifications();
              }}
              content={notificationContent}
            >
              <Badge count={unreadNotificationCount} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#666' }} />
              </Badge>
            </Popover>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar
                  style={{ backgroundColor: '#e50914' }}
                  icon={<UserOutlined />}
                />
                <span style={{ fontWeight: 500 }}>Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Breadcrumb + Content */}
        <Content
          style={{
            margin: 24,
            minHeight: 'calc(100vh - 112px)',
            background: '#fff',
            borderRadius: 8,
            padding: breadcrumb ? 0 : 24,
          }}
        >
          {breadcrumb && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
              {breadcrumb}
            </div>
          )}
          <div style={{ padding: breadcrumb ? 24 : 0 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
