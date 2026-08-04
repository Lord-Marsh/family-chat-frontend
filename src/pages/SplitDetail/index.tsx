import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Modal, Input, message, Tag, Popconfirm } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSplit, settleSplit, revertSettlement, deleteSplit } from './service';
import { Split } from '../../types';
import SettlementItem from '../../components/SettlementItem';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AutoContext';
import './styles.less';

const SplitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [split, setSplit] = useState<Split | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settle Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string>('');
  const [settleNote, setSettleNote] = useState('');
  const [settling, setSettling] = useState(false);

  const fetchSplit = async () => {
    try {
      const res = await getSplit(id!);
      setSplit(res);
    } catch (error) {
      message.error('Failed to load split details');
      navigate('/splits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSplit();
  }, [id]);

  // Realtime updates
  useSocket('settlement_updated', (data) => {
    if (data._id === id) fetchSplit();
  });
  useSocket('split_updated', (data) => {
    if (data._id === id) fetchSplit();
  });
  useSocket('split_deleted', (data) => {
    if (data.splitId === id) {
      message.warning('This split was deleted');
      navigate('/splits');
    }
  });

  const handleMarkPaidClick = (settlementId: string) => {
    setSelectedSettlementId(settlementId);
    setSettleNote('');
    setIsSettleModalOpen(true);
  };

  const handleConfirmSettle = async () => {
    setSettling(true);
    try {
      await settleSplit(id!, { settlementId: selectedSettlementId, note: settleNote });
      message.success('Marked as paid!');
      setIsSettleModalOpen(false);
      fetchSplit();
    } catch (error) {
      message.error('Failed to mark as paid');
    } finally {
      setSettling(false);
    }
  };

  const handleRevert = async (settlementId: string) => {
    try {
      await revertSettlement(id!, settlementId);
      message.success('Settlement reverted');
      fetchSplit();
    } catch (error) {
      message.error('Failed to revert settlement');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSplit(id!);
      message.success('Split deleted');
      navigate('/splits');
    } catch (error) {
      message.error('Failed to delete split');
    }
  };

  if (loading || !split) {
    return <div className="loading-center"><Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} /></div>;
  }

  const isSA = user?.userType === 'sa';

  return (
    <div className="page-container split-detail">
      <div className="nav-header">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="back-btn" />
        {isSA && (
          <Popconfirm title="Delete this split?" onConfirm={handleDelete} okText="Yes" cancelText="No">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </div>

      <div className="detail-header glass-card animate-fade-in-up">
        <div className="category-emoji">💎</div>
        <h2>{split.description}</h2>
        <div className="amount">₹{split.totalAmount}</div>
        <Tag color={split.status === 'settled' ? 'success' : 'processing'}>{split.status.toUpperCase()}</Tag>
        <div className="meta">
          Created by {split.createdByName || 'Unknown'} on {new Date(split.createdAt).toLocaleDateString('en-IN')}
        </div>
      </div>

      <div className="section animate-fade-in-up stagger-1">
        <h3>Paid By</h3>
        <div className="list-card glass-card">
          {split.paidBy.map(p => (
            <div key={p.userId} className="list-row">
              <span>{p.displayName}</span>
              <span className="value">₹{p.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section animate-fade-in-up stagger-2">
        <h3>Split Among ({split.splitType})</h3>
        <div className="list-card glass-card">
          {split.splitAmong.map(s => (
            <div key={s.userId} className="list-row">
              <span>{s.displayName}</span>
              <span className="value">₹{s.share.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section animate-fade-in-up stagger-3">
        <h3>Settlements</h3>
        <div className="settlements-list">
          {split.settlements.length > 0 ? (
            split.settlements.map(s => (
              <SettlementItem 
                key={s.id} 
                settlement={s} 
                onMarkPaid={handleMarkPaidClick} 
                onRevert={handleRevert} 
              />
            ))
          ) : (
            <div className="empty-state">No settlements required.</div>
          )}
        </div>
      </div>

      <Modal
        title="Mark as Paid"
        open={isSettleModalOpen}
        onOk={handleConfirmSettle}
        onCancel={() => setIsSettleModalOpen(false)}
        confirmLoading={settling}
        className="dark-modal"
      >
        <p>Are you sure you want to mark this as paid?</p>
        <Input.TextArea 
          placeholder="Add a note (optional)" 
          value={settleNote}
          onChange={e => setSettleNote(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
};

export default SplitDetail;
