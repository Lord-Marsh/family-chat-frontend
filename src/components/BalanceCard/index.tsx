import { Avatar } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './styles.less';

interface BalanceCardProps {
  userA: { name: string; avatar?: string };
  userB: { name: string; avatar?: string };
  netAmount: number; // positive = A owes B, negative = B owes A
}

const BalanceCard = ({ userA, userB, netAmount }: BalanceCardProps) => {
  const isAOwesB = netAmount > 0;
  const amount = Math.abs(netAmount);
  
  if (amount === 0) return null; // Or show "Settled up"

  return (
    <div className="balance-card glass-card">
      <div className="users-container">
        <div className="user">
          <Avatar size={40} style={{ backgroundColor: '#5c5c5c' }}>
            {userA.name.charAt(0).toUpperCase()}
          </Avatar>
          <span>{userA.name}</span>
        </div>
        
        <div className={`flow ${isAOwesB ? 'owes' : 'owed'}`}>
          <div className="amount">₹{amount}</div>
          {isAOwesB ? <ArrowRightOutlined className="icon" /> : <ArrowLeftOutlined className="icon" />}
        </div>

        <div className="user">
          <Avatar size={40} style={{ backgroundColor: '#5c5c5c' }}>
            {userB.name.charAt(0).toUpperCase()}
          </Avatar>
          <span>{userB.name}</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
