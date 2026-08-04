import type { Split } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Progress, Tag } from 'antd';
import './styles.less';

interface SplitCardProps {
  split: Split;
  index: number;
}

const SplitCard = ({ split, index }: SplitCardProps) => {
  const navigate = useNavigate();

  const totalSettlements = split.settlements.length;
  const paidSettlements = split.settlements.filter(s => s.status === 'paid').length;
  const progress = totalSettlements === 0 ? 100 : Math.round((paidSettlements / totalSettlements) * 100);

  const date = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
  }).format(new Date(split.createdAt));

  return (
    <div 
      className={`split-card glass-card animate-fade-in-up stagger-${(index % 4) + 1}`}
      onClick={() => navigate(`/splits/${split._id}`)}
    >
      <div className="card-header">
        <div className="title-section">
          <span className="category-emoji">💎</span>
          <div className="title-info">
            <h3 className="description">{split.description}</h3>
            <span className="date">{date}</span>
          </div>
        </div>
        <div className="amount-section">
          <div className="amount">₹{split.totalAmount}</div>
          <Tag color={split.status === 'settled' ? 'success' : 'processing'} className="status-badge">
            {split.status.toUpperCase()}
          </Tag>
        </div>
      </div>
      
      {totalSettlements > 0 && (
        <div className="progress-section">
          <div className="progress-text">
            <span>Settlements</span>
            <span>{paidSettlements} of {totalSettlements} paid</span>
          </div>
          <Progress 
            percent={progress} 
            showInfo={false} 
            strokeColor="#00d4aa" 
            trailColor="rgba(255,255,255,0.1)"
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default SplitCard;
