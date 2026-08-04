import { Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AutoContext';
import { useNavigate } from 'react-router-dom';
import './styles.less';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
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
  );
};

export default Header;
