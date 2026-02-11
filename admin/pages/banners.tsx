import React from 'react';
import { Breadcrumb, Card, Typography, Empty } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';

const { Title, Text } = Typography;

export default function BannersPage() {
  const breadcrumb = (
    <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Banner' }]} />
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}><PictureOutlined /> Quản lý Banner</Title>
        </div>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Tính năng quản lý banner trang chủ sẽ được phát triển ở Phase 2.</Text>
                <br />
                <Text type="secondary">Bạn sẽ có thể thêm/sửa/xóa banner hiển thị trên trang chủ web.</Text>
              </div>
            }
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
