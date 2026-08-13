import type { Settlement } from '../../types';
import { Button, Tag } from 'antd';
import { CheckCircleFilled, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AutoContext';
import { useState, useEffect } from 'react';
import './styles.less';

import { Modal } from 'antd';
import confetti from 'canvas-confetti';

interface SettlementItemProps {
  settlement: Settlement;
  onMarkPaid: (id: string) => void;
  onRevert: (id: string) => void;
  onQuickSettle?: (id: string) => Promise<void>;
}

const SettlementItem = ({ settlement, onMarkPaid, onRevert, onQuickSettle }: SettlementItemProps) => {
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now());
  const [pendingGPayCheck, setPendingGPayCheck] = useState(false);
  
  useEffect(() => {
    // Re-evaluate the timer every 30 seconds to hide the revert button automatically
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pendingGPayCheck) {
        setPendingGPayCheck(false);
        Modal.confirm({
          title: 'Payment Complete?',
          content: 'Did you complete the payment on GPay?',
          okText: 'Yes, Mark as Paid',
          cancelText: 'Not yet',
          className: 'dark-modal',
          onOk: async () => {
            if (onQuickSettle) {
              await onQuickSettle(settlement.id);
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
              });
            } else {
              onMarkPaid(settlement.id);
            }
          }
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pendingGPayCheck, settlement.id, onMarkPaid, onQuickSettle]);
  
  const isPending = settlement.status === 'pending';
  const canMarkPaid = isPending && user?.id === settlement.fromUserId;
  const isSA = user?.userType === 'sa';
  const isMarkedByMe = settlement.markedBy === user?.id;
  const paidTime = settlement.paidAt ? new Date(settlement.paidAt).getTime() : 0;
  const minutesSincePaid = (now - paidTime) / 60000;
  const canRevert = !isPending && (isSA || (isMarkedByMe && minutesSincePaid <= 10));

  return (
    <div className={`settlement-item ${isPending ? 'pending' : 'paid'}`}>
      <div className="settlement-main">
        <div className="users-flow text-sentence">
           <strong>{settlement.fromDisplayName}</strong> should pay <strong>{settlement.toDisplayName}</strong>
           <span className="amount-badge">₹{Math.round(settlement.amount)}</span>
        </div>

        <div className="status-action">
          {isPending ? (
            <Tag color="error">PENDING</Tag>
          ) : (
            <Tag color="success" icon={<CheckCircleFilled />}>PAID</Tag>
          )}
        </div>
      </div>

      {(canMarkPaid || canRevert || settlement.note) && (
        <div className="settlement-actions">
          {settlement.note && <div className="note-text">"{settlement.note}"</div>}
          <div className="action-buttons">
            {canMarkPaid && settlement.toUserUpiId && (
              <a 
                href={`upi://pay?pa=${encodeURIComponent(settlement.toUserUpiId)}&pn=${encodeURIComponent(settlement.toDisplayName || '')}&am=${Math.round(settlement.amount)}&cu=INR`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setPendingGPayCheck(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  color: '#3c4043',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontWeight: 600,
                  fontSize: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease',
                  border: '1px solid #dadce0'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <GoogleOutlined style={{ color: '#EA4335', fontSize: '14px' }} />
                Pay
              </a>
            )}
            {canMarkPaid && (
              <Button type="primary" size="small" onClick={() => onMarkPaid(settlement.id)}>
                Mark as Paid
              </Button>
            )}
            {canRevert && (
              <Button type="default" danger size="small" onClick={() => onRevert(settlement.id)}>
                Revert
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementItem;
