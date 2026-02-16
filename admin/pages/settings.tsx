import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, Tabs, message } from 'antd';
import {
  GlobalOutlined,
  BellOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';

const { Option } = Select;

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      message.success('Lưu cài đặt thành công!');
      setLoading(false);
    }, 1000);
  };

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <GlobalOutlined />
          Chung
        </span>
      ),
      children: (
        <Form layout="vertical">
          <Form.Item label="Tên website" initialValue="NextFlix">
            <Input placeholder="Tên website" />
          </Form.Item>
          <Form.Item label="Mô tả" initialValue="Website xem phim trực tuyến">
            <Input.TextArea rows={3} placeholder="Mô tả website" />
          </Form.Item>
          <Form.Item label="Ngôn ngữ mặc định">
            <Select defaultValue="vi" style={{ width: '100%' }}>
              <Option value="vi">Tiếng Việt</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Tiền tệ">
            <Select defaultValue="vnd" style={{ width: '100%' }}>
              <Option value="vnd">VND (Việt Nam Đồng)</Option>
              <Option value="usd">USD (US Dollar)</Option>
            </Select>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Thông báo
        </span>
      ),
      children: (
        <Form layout="vertical">
          <Form.Item label="Email thông báo">
            <Input placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item label="Thông báo qua email">
            <Switch defaultChecked /> <span style={{ marginLeft: 8 }}>Bật/Tắt</span>
          </Form.Item>
          <Form.Item label="Thông báo bình luận mới">
            <Switch defaultChecked /> <span style={{ marginLeft: 8 }}>Bật/Tắt</span>
          </Form.Item>
          <Form.Item label="Thông báo đăng ký thành viên">
            <Switch /> <span style={{ marginLeft: 8 }}>Bật/Tắt</span>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyOutlined />
          Bảo mật
        </span>
      ),
      children: (
        <Form layout="vertical">
          <Form.Item label="Xác thực 2 bước (2FA)">
            <Switch /> <span style={{ marginLeft: 8 }}>Bật/Tắt</span>
          </Form.Item>
          <Form.Item label="Yêu cầu mật khẩu mạnh">
            <Switch defaultChecked /> <span style={{ marginLeft: 8 }}>Bật/Tắt</span>
          </Form.Item>
          <Form.Item label="Phiên đăng nhập tối đa">
            <Select defaultValue="30" style={{ width: '100%' }}>
              <Option value="15">15 phút</Option>
              <Option value="30">30 phút</Option>
              <Option value="60">1 giờ</Option>
              <Option value="120">2 giờ</Option>
            </Select>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 600 }}>Cài đặt</h1>

        <Card>
          <Tabs items={tabItems} />

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button type="primary" loading={loading} onClick={handleSave}>
              Lưu cài đặt
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
