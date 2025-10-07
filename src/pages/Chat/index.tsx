import React, { useState, useEffect } from 'react';
import { Layout, List, Avatar, Typography, Button, Spin, Empty } from 'antd';
import { UserOutlined, LogoutOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUsers } from './service';
import './styles.less';
import type { User } from '../../types';
import { useAuth } from '../../contexts/AutoContext';
import ChatWindow from './chatWindow';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

const Chat: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="chat-layout">
      <Header className="chat-app-header">
        <div className="header-left">
          <MessageOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            Family Chat
          </Title>
        </div>
        <div className="header-right">
          <Avatar
            size={36}
            src={currentUser?.avatar}
            icon={!currentUser?.avatar && <UserOutlined />}
          />
          <span className="user-name">{currentUser?.displayName}</span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: '#fff' }}
          >
            Logout
          </Button>
        </div>
      </Header>

      <Layout>
        <Sider width={300} theme="light" className="chat-sider">
          <div className="sider-header">
            <Title level={5}>Conversations</Title>
          </div>

          {loading ? (
            <div className="sider-loading">
              <Spin />
            </div>
          ) : users.length === 0 ? (
            <div className="sider-empty">
              <Empty description="No users found" />
            </div>
          ) : (
            <List
              className="user-list"
              dataSource={users}
              renderItem={(user) => (
                <List.Item
                  className={`user-list-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={48}
                        src={user.avatar}
                        icon={!user.avatar && <UserOutlined />}
                      />
                    }
                    title={user.displayName}
                    description={`@${user.username}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Sider>

        <Content className="chat-content">
          {selectedUser ? (
            <ChatWindow selectedUser={selectedUser} />
          ) : (
            <div className="chat-welcome">
              <MessageOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
              <Title level={3} style={{ color: '#8c8c8c' }}>
                Welcome to Family Chat
              </Title>
              <Text type="secondary">
                Select a family member from the left to start chatting
              </Text>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Chat;