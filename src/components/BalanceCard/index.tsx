import { Avatar, Collapse } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import './styles.less';

const { Panel } = Collapse;

interface Detail {
  description: string;
  amount: number;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
}

interface BalanceCardProps {
  userA: { id: string; name: string; avatar?: string };
  userB: { id: string; name: string; avatar?: string };
  netAmount: number; // positive = A owes B, negative = B owes A
  details?: Detail[];
}

const BalanceCard = ({ userA, userB, netAmount, details = [] }: BalanceCardProps) => {
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

      {details.length >= 2 && (
        <div className="details-container">
          <Collapse 
            ghost 
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: 'rgba(255,255,255,0.5)' }} />}
          >
            <Panel header={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>View how this was calculated</span>} key="1">
              <div className="details-list">
                {details.map((d, i) => {
                  // Determine if the flow for THIS detail matches the MAIN flow or is opposite
                  // If main flow is A owes B (isAOwesB is true)
                  return (
                    <div key={i} className="detail-item">
                      <div className="detail-desc">{d.description}</div>
                      <div className="detail-math">
                        <span className="detail-who">{d.fromUserName.split(' ')[0]} owes {d.toUserName.split(' ')[0]}</span>
                        <span className="detail-amt">₹{d.amount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </Collapse>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
