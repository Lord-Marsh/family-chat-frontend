import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, PlusCircleFilled, UnorderedListOutlined, WalletOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AutoContext';
import './styles.less';

const BottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: <HomeOutlined />, label: 'Home' },
    { path: '/splits', icon: <UnorderedListOutlined />, label: 'Splits' },
    { path: '/add', icon: <PlusCircleFilled className="add-btn" />, label: 'Add', special: true },
    { path: '/balances', icon: <WalletOutlined />, label: 'Balances' },
  ];

  if (user?.userType === 'sa') {
    navItems.push({ path: '/logs', icon: <SettingOutlined />, label: 'Logs' });
  }

  return (
    <nav className="bottom-nav glass-card">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${pathname === item.path ? 'active' : ''} ${item.special ? 'special' : ''}`}
        >
          {item.icon}
          {!item.special && <span className="nav-label">{item.label}</span>}
          {pathname === item.path && !item.special && <div className="active-dot" />}
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
