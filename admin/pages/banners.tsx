import React from "react";
import { Card, Empty, Typography, Breadcrumb } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import AdminLayout from "../components/AdminLayout"; // sửa path nếu khác

const { Title, Text } = Typography;

export default function BannersPage() {
  const breadcrumb = (
    <Breadcrumb items={[{ title: "Trang chủ" }, { title: "Banner" }]} />
  );

  return (
    <AdminLayout breadcrumb={breadcrumb}>
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          border: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            <PictureOutlined /> Quản lý Banner
          </Title>
        </div>

        <Card
          bordered={false}
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
          bodyStyle={{ padding: 28 }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">
                  Tính năng quản lý banner trang chủ sẽ được phát triển ở phiên bản tiếp theo.
                </Text>
                <br />
                <Text type="secondary">
                  Bạn sẽ có thể thêm / sửa / xóa banner hiển thị trên trang chủ.
                </Text>
              </div>
            }
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
