import { Settlement } from '../../types';
import { Button, Tag, Avatar } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useAuth } from '../../contexts/AutoContext';
import { useState, useEffect } from 'react';
import './styles.less';

interface SettlementItemProps {
  settlement: Settlement;
  onMarkPaid: (id: string) => void;
  onRevert: (id: string) => void;
}

const SettlementItem = ({ settlement, onMarkPaid, onRevert }: SettlementItemProps) => {
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    // Re-evaluate the timer every 30 seconds to hide the revert button automatically
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);
  
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
           <span className="amount-badge">₹{settlement.amount}</span>
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
