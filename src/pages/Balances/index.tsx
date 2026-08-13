import { useState, useEffect } from 'react';
import { Spin, Button, message } from 'antd';
import { LoadingOutlined, WhatsAppOutlined } from '@ant-design/icons';
import Header from '../../components/Header';
import BalanceCard from '../../components/BalanceCard';
import { getBalancesSummary } from '../Dashboard/service';
import { getBalances, remindAllWhatsapp } from './service';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AutoContext';
import './styles.less';

const Balances = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);

  const fetchData = async () => {
    try {
      const [sumRes, balRes] = await Promise.all([
        getBalancesSummary(),
        getBalances()
      ]);
      setSummary(sumRes);
      setBalances(balRes.balances || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSocket('split_created', fetchData);
  useSocket('settlement_updated', fetchData);
  useSocket('split_updated', fetchData);
  useSocket('split_deleted', fetchData);

  if (loading) {
    return <div className="loading-center"><Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} /></div>;
  }

  const handleRemindAll = async () => {
    setReminding(true);
    try {
      const res = await remindAllWhatsapp();
      message.success(res.message || 'Reminders sent successfully');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send reminders');
    } finally {
      setReminding(false);
    }
  };

  const youOweTotal = summary?.youOwe?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;
  const owedToYouTotal = summary?.owedToYou?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;

  return (
    <div className="page-container balances-page">
      <Header title="Balances" />

      {user?.userType === 'sa' && (
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<WhatsAppOutlined />} 
            onClick={handleRemindAll} 
            loading={reminding}
            style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
          >
            Remind All (WhatsApp)
          </Button>
        </div>
      )}

      <div className="summary-cards animate-fade-in-up stagger-1">
        <div className="summary-card owe glass-card">
          <div className="label">You Need to Pay</div>
          <div className="amount">₹{Math.round(youOweTotal)}</div>
        </div>
        <div className="summary-card owed glass-card">
          <div className="label">You Will Receive</div>
          <div className="amount">₹{Math.round(owedToYouTotal)}</div>
        </div>
      </div>

      <div className="detailed-balances animate-fade-in-up stagger-2">
        <h3 className="section-title">Detailed Balances</h3>
        
        {balances.length > 0 ? (
          balances.map((b, i) => (
            <BalanceCard 
              key={i}
              userA={{ id: b.fromUser?.id, name: b.fromUser?.displayName || 'Unknown', upiId: b.fromUser?.upiId }}
              userB={{ id: b.toUser?.id, name: b.toUser?.displayName || 'Unknown', upiId: b.toUser?.upiId }}
              netAmount={b.amount} // If it's positive, fromUser owes toUser
              details={b.details}
            />
          ))
        ) : (
          <div className="empty-state glass-card">
            All settled up! No outstanding balances.
          </div>
        )}
      </div>
    </div>
  );
};

export default Balances;
