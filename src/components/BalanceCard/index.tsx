import { Avatar, Collapse } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CaretRightOutlined, GoogleOutlined } from '@ant-design/icons';
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
  userA: { id: string; name: string; avatar?: string; upiId?: string };
  userB: { id: string; name: string; avatar?: string; upiId?: string };
  netAmount: number; // positive = A owes B, negative = B owes A
  details?: Detail[];
  currentUser?: any;
}

const BalanceCard = ({ userA, userB, netAmount, details = [], currentUser }: BalanceCardProps) => {
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

      {details.length >= 2 && (() => {
        // Build the math equation relative to the final result
        const mathParts: string[] = [];
        details.forEach((d, i) => {
          // If netAmount > 0, main flow is A owes B.
          // If d.fromUserId === userA.id, this detail is A owes B (Positive for main flow)
          // If netAmount < 0, main flow is B owes A.
          // If d.fromUserId === userB.id, this detail is B owes A (Positive for main flow)
          
          let isPositiveForMainFlow = false;
          if (netAmount > 0) {
            isPositiveForMainFlow = (d.fromUserId === userA.id);
          } else {
            isPositiveForMainFlow = (d.fromUserId === userB.id);
          }

          if (i === 0) {
            // First item just gets its amount, optionally with minus if it opposes main flow
            mathParts.push(`${isPositiveForMainFlow ? '' : '-'}₹${d.amount}`);
          } else {
            mathParts.push(`${isPositiveForMainFlow ? '+' : '-'} ₹${d.amount}`);
          }
        });

        const mathEquation = `${mathParts.join(' ')} = ₹${amount}`;

        return (
          <div className="details-container">
            <Collapse 
              ghost 
              defaultActiveKey={['1']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} style={{ color: 'rgba(255,255,255,0.5)' }} />}
            >
              <Panel 
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>View how this was calculated</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 600 }}>{mathEquation}</span>
                  </div>
                } 
                key="1"
              >
                <div className="details-list">
                  {details.map((d, i) => (
                    <div key={i} className="detail-item">
                      <div className="detail-desc">{d.description}</div>
                      <div className="detail-math">
                        <span className="detail-who">{d.fromUserName.split(' ')[0]} owes {d.toUserName.split(' ')[0]}</span>
                        <span className="detail-amt">₹{d.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </Collapse>
          </div>
        );
      })()}

      {(() => {
        // Only show GPay button if the current user owes the other user, and the other user has a upiId
        let owesToUser = null;
        if (currentUser) {
          if (isAOwesB && currentUser.id === userA.id) {
            owesToUser = userB;
          } else if (!isAOwesB && currentUser.id === userB.id) {
            owesToUser = userA;
          }
        }

        if (owesToUser && owesToUser.upiId) {
          // upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
          const gpayLink = `upi://pay?pa=${encodeURIComponent(owesToUser.upiId)}&pn=${encodeURIComponent(owesToUser.name)}&tn=SplitPay%20Settlement&am=${amount}&cu=INR`;
          
          return (
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
              <a 
                href={gpayLink} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: '#ffffff', 
                  color: '#3c4043', 
                  padding: '10px 24px', 
                  borderRadius: '24px', 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <GoogleOutlined style={{ color: '#EA4335', fontSize: '18px' }} />
                Pay via GPay
              </a>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default BalanceCard;
