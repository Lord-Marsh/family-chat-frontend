import { Avatar, Dropdown, Modal, Form, Input, Button, message } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AutoContext';
import { useState } from 'react';
import request from '../../utils/request';

import './styles.less';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, logout, updateUser } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleProfileClick = () => {
    form.setFieldsValue({
      displayName: user?.displayName,
      upiId: user?.upiId
    });
    setIsProfileModalOpen(true);
  };

  const onProfileSave = async (values: any) => {
    setLoading(true);
    try {
      const res = await request.put('/users/me', { data: values });
      updateUser(res);
      message.success('Profile updated successfully');
      setIsProfileModalOpen(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: handleProfileClick
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <>
      <div className="header-container glass-card">
        <h1 className="header-title">{title}</h1>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Avatar 
            className="user-avatar"
            style={{ backgroundColor: '#00d4aa', verticalAlign: 'middle', cursor: 'pointer' }}
            size="large"
          >
            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </Dropdown>
      </div>

      <Modal
        title="Edit Profile"
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onProfileSave}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="displayName"
            label="Display Name"
            rules={[{ required: true, message: 'Please input a display name' }]}
          >
            <Input placeholder="Your display name" />
          </Form.Item>
          <Form.Item
            name="upiId"
            label="UPI ID"
            tooltip="Used for Google Pay and other UPI payments"
          >
            <Input placeholder="e.g. name@okhdfcbank" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setIsProfileModalOpen(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Header;
