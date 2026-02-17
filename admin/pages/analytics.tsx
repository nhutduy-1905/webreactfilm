import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Segmented, Typography, Empty, Spin } from 'antd';
import {
  VideoCameraOutlined,
  UserOutlined,
  CommentOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined,
  FireOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const { Text } = Typography;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Granularity = 'day' | 'month';

type DashboardStats = {
  totalMovies: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
  totalRatingStars: number;
};

type TrendData = {
  key: string;
  label: string;
  views: number;
  likes: number;
  ratingStars: number;
  comments: number;
};

type HotMovie = {
  movieId: string;
  title: string;
  views: number;
  likes: number;
  ratingStars: number;
  comments: number;
  score: number;
};

type AnalyticsResponse = {
  summary: DashboardStats;
  timeline: TrendData[];
  hotMovies: HotMovie[];
  granularity: Granularity;
};

type SeriesKey = 'views' | 'likes' | 'ratingStars' | 'comments';

const LINE_SERIES: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: 'views', label: 'Lượt xem', color: '#e50914' },
  { key: 'likes', label: 'Lượt tim', color: '#fa8c16' },
  { key: 'ratingStars', label: 'Sao đánh giá', color: '#1677ff' },
  { key: 'comments', label: 'Binh luan', color: '#52c41a' },
];

const numberFormatter = new Intl.NumberFormat('vi-VN');

const TimelineLineChart: React.FC<{ data: TrendData[] }> = ({ data }) => {
  if (!data.length) {
    return (
      <div style={{ padding: 32 }}>
        <Empty description="Chưa có dữ liệu theo thời gian" />
      </div>
    );
  }

  const width = 960;
  const height = 300;
  const padding = { top: 20, right: 24, bottom: 40, left: 56 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xStep = plotWidth / Math.max(1, data.length - 1);
  const maxValue = Math.max(
    5,
    ...data.flatMap((point) => [point.views, point.likes, point.ratingStars, point.comments])
  );

  const xAt = (index: number) => padding.left + xStep * index;
  const yAt = (value: number) => padding.top + (1 - value / maxValue) * plotHeight;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxValue * ratio),
    y: yAt(maxValue * ratio),
  }));
  const xLabelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {LINE_SERIES.map((series) => (
          <div key={series.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 3, background: series.color, borderRadius: 6 }} />
            <Text>{series.label}</Text>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 320 }}>
        {yTicks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="#f0f0f0"
            />
            <text
              x={padding.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#8c8c8c"
            >
              {numberFormatter.format(tick.value)}
            </text>
          </g>
        ))}

        {LINE_SERIES.map((series) => {
          const polylinePoints = data
            .map((point, index) => `${xAt(index)},${yAt(point[series.key])}`)
            .join(' ');

          return (
            <g key={series.key}>
              <polyline
                points={polylinePoints}
                fill="none"
                stroke={series.color}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {data.length <= 40 && data.map((point, index) => (
                <circle
                  key={`${series.key}-${point.key}`}
                  cx={xAt(index)}
                  cy={yAt(point[series.key])}
                  r={2.8}
                  fill={series.color}
                />
              ))}
            </g>
          );
        })}

        {data.map((point, index) => {
          const shouldRender = index % xLabelStep === 0 || index === data.length - 1;
          if (!shouldRender) return null;
          return (
            <text
              key={`x-${point.key}`}
              x={xAt(index)}
              y={height - 12}
              textAnchor="middle"
              fontSize="11"
              fill="#8c8c8c"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMovies: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0,
    totalLikes: 0,
    totalRatingStars: 0,
  });
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [hotMovies, setHotMovies] = useState<HotMovie[]>([]);
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const limit = granularity === 'month' ? 12 : 30;
        const response = await axios.get<AnalyticsResponse>(`${API_URL}/api/analytics`, {
          params: { granularity, limit },
        });

        setStats(response.data?.summary || {
          totalMovies: 0,
          totalUsers: 0,
          totalComments: 0,
          totalViews: 0,
          totalLikes: 0,
          totalRatingStars: 0,
        });
        setTrends(Array.isArray(response.data?.timeline) ? response.data.timeline : []);
        setHotMovies(Array.isArray(response.data?.hotMovies) ? response.data.hotMovies : []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setStats({
          totalMovies: 0,
          totalUsers: 0,
          totalComments: 0,
          totalViews: 0,
          totalLikes: 0,
          totalRatingStars: 0,
        });
        setTrends([]);
        setHotMovies([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAnalytics();
  }, [granularity]);

  const peakPoint = useMemo(() => {
    if (!trends.length) return null;
    return trends.reduce((best, current) => {
      const currentScore = current.views + current.likes * 4 + current.ratingStars * 3 + current.comments * 5;
      const bestScore = best.views + best.likes * 4 + best.ratingStars * 3 + best.comments * 5;
      return currentScore > bestScore ? current : best;
    }, trends[0]);
  }, [trends]);

  const columns = [
    {
      title: 'Top',
      key: 'rank',
      width: 60,
      render: (_: unknown, __: HotMovie, index: number) => index + 1,
    },
    {
      title: 'Phim',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      width: 120,
      render: (value: number) => numberFormatter.format(value || 0),
    },
    {
      title: 'Lượt tim',
      dataIndex: 'likes',
      key: 'likes',
      width: 120,
      render: (value: number) => numberFormatter.format(value || 0),
    },
    {
      title: 'Sao đánh giá',
      dataIndex: 'ratingStars',
      key: 'ratingStars',
      width: 130,
      render: (value: number) => numberFormatter.format(value || 0),
    },
    {
      title: 'Binh luan',
      dataIndex: 'comments',
      key: 'comments',
      width: 120,
      render: (value: number) => numberFormatter.format(value || 0),
    },
    {
      title: 'Điểm hot',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      render: (value: number) => numberFormatter.format(Math.round(value || 0)),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 600 }}>
          Thống kê & Báo cáo
        </h1>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Tổng số phim"
                value={stats.totalMovies}
                prefix={<VideoCameraOutlined style={{ color: '#e50914' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Người dùng"
                value={stats.totalUsers}
                prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Bình luận"
                value={stats.totalComments}
                prefix={<CommentOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Lượt xem"
                value={stats.totalViews}
                prefix={<EyeOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Lượt tim"
                value={stats.totalLikes}
                prefix={<HeartOutlined style={{ color: '#f5222d' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Tổng sao đánh giá"
                value={stats.totalRatingStars}
                prefix={<StarOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} xl={18}>
            <Card
              title="Biểu đồ theo thời gian (Line Chart)"
              extra={(
                <Segmented
                  options={[
                    { label: 'Theo ngày', value: 'day' },
                    { label: 'Theo tháng', value: 'month' },
                  ]}
                  value={granularity}
                  onChange={(value) => setGranularity(value as Granularity)}
                />
              )}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : (
                <TimelineLineChart data={trends} />
              )}
            </Card>
          </Col>
          <Col xs={24} xl={6}>
            <Card title="Traffic nổi bật">
              {peakPoint ? (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary">Thời điểm tăng cao</Text>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{peakPoint.label}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div><EyeOutlined /> {numberFormatter.format(peakPoint.views)} lượt xem</div>
                    <div><HeartOutlined /> {numberFormatter.format(peakPoint.likes)} lượt tim</div>
                    <div><StarOutlined /> {numberFormatter.format(peakPoint.ratingStars)} sao</div>
                    <div><CommentOutlined /> {numberFormatter.format(peakPoint.comments)} binh luan</div>
                  </div>
                </div>
              ) : (
                <Empty description="Chưa có dữ liệu" />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Phim đang hot"
              extra={<FireOutlined style={{ color: '#fa541c' }} />}
            >
              <Table
                columns={columns}
                dataSource={hotMovies}
                loading={loading}
                rowKey="movieId"
                pagination={false}
                locale={{ emptyText: 'Chưa có dữ liệu tương tác phim' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
