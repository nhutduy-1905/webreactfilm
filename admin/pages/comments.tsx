import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Tag, Button, Space, Card, Row, Col, Statistic, Modal, message, Popconfirm } from 'antd';
import {
  CommentOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Comment {
  id: string;
  content: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  likes: number;
  movie: {
    id: string;
    title: string;
    imageUrl?: string;
  };
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  all: number;
}

const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [page, search, statusFilter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/comments/admin`, {
        params: {
          page,
          limit: 20,
          status: statusFilter,
          ...(search ? { search } : {}),
        },
      });
      setComments(response.data.comments || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
      setStats(response.data.stats || { pending: 0, approved: 0, rejected: 0, all: 0 });
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      setTotal(0);
      setTotalPages(1);
      setStats({ pending: 0, approved: 0, rejected: 0, all: 0 });
      message.error('Khong the tai danh sach binh luan');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await axios.patch(`${API_URL}/api/comments/admin`, { id });
      message.success('Duyệt bình luận thành công');
      fetchComments();
    } catch (error) {
      console.error('Error approving comment:', error);
      message.error('Không thể duyệt bình luận');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa bình luận',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setProcessingId(id);
          await axios.delete(`${API_URL}/api/comments/admin`, {
            params: { id },
          });
          message.success('Đã xóa bình luận thành công');
          fetchComments();
        } catch (error) {
          console.error('Error deleting comment:', error);
          message.error('Không thể xóa bình luận');
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleViewDetail = (comment: Comment) => {
    setSelectedComment(comment);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTag = (status: string) => {
    const config = {
      pending: { color: 'orange', text: 'Chờ duyệt' },
      approved: { color: 'green', text: 'Đã duyệt' },
      rejected: { color: 'red', text: 'Từ chối' },
    };
    const { color, text } = config[status as keyof typeof config] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (page - 1) * 20 + index + 1,
    },
    {
      title: 'Phim',
      dataIndex: 'movie',
      key: 'movie',
      width: 200,
      render: (movie: Comment['movie']) => (
        <div style={{ fontWeight: 500 }}>{movie?.title || 'N/A'}</div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div style={{ maxWidth: 300 }}>
          {content.length > 80 ? content.substring(0, 80) + '...' : content}
        </div>
      ),
    },
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (name: string, record: Comment) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_: any, record: Comment) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
              loading={processingId === record.id}
              style={{ color: '#52c41a' }}
            >
              Duyệt
            </Button>
          )}
          <Popconfirm
            title="Xóa bình luận?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleReject(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 600 }}>
            Quản lý bình luận
          </h1>
          <p style={{ margin: 0, color: '#888' }}>
            Tổng cộng {total} bình luận
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="Tất cả"
                value={stats.all}
                prefix={<CommentOutlined />}
                valueStyle={{ fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="Chờ duyệt"
                value={stats.pending}
                prefix={<FilterOutlined />}
                valueStyle={{ fontSize: 24, color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="Đã duyệt"
                value={stats.approved}
                prefix={<CheckOutlined />}
                valueStyle={{ fontSize: 24, color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="Từ chối"
                value={stats.rejected}
                prefix={<CloseOutlined />}
                valueStyle={{ fontSize: 24, color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filter Tabs */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <Button
                  key={status}
                  type={statusFilter === status ? 'primary' : 'default'}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                </Button>
              ))}
            </div>

            {/* Search */}
            <Input
              placeholder="Tìm kiếm theo nội dung..."
              prefix={<SearchOutlined />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                setSearch(searchInput.trim());
              }}
              style={{ width: 280 }}
              allowClear
              onClear={() => {
                setSearchInput('');
                setPage(1);
                setSearch('');
              }}
            />
          </div>
        </Card>

        {/* Comments Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={comments}
            loading={loading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: 20,
              total: total,
              onChange: (p) => setPage(p),
              showTotal: (t) => `Tổng ${t} bình luận`,
            }}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title="Chi tiết bình luận"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
            selectedComment?.status === 'pending' && (
              <Button
                key="approve"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  handleApprove(selectedComment.id);
                  setDetailModalVisible(false);
                }}
              >
                Duyệt
              </Button>
            ),
          ]}
        >
          {selectedComment && (
            <div>
              <p><strong>Phim:</strong> {selectedComment.movie?.title}</p>
              <p><strong>Người dùng:</strong> {selectedComment.userName} ({selectedComment.userEmail})</p>
              <p><strong>Trạng thái:</strong> {getStatusTag(selectedComment.status)}</p>
              <p><strong>Ngày tạo:</strong> {formatDate(selectedComment.createdAt)}</p>
              <p><strong>Lượt thích:</strong> {selectedComment.likes}</p>
              <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <strong>Nội dung:</strong>
                <p style={{ marginTop: 8 }}>{selectedComment.content}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default CommentsPage;


