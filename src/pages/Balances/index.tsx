import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Header from '../../components/Header';
import BalanceCard from '../../components/BalanceCard';
import { getBalancesSummary } from '../Dashboard/service';
import { getBalances } from './service';
import { useSocket } from '../../hooks/useSocket';
import './styles.less';

const Balances = () => {
  const [balances, setBalances] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const youOweTotal = summary?.youOwe?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;
  const owedToYouTotal = summary?.owedToYou?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;

  return (
    <div className="page-container balances-page">
      <Header title="Balances" />

      <div className="summary-cards animate-fade-in-up stagger-1">
        <div className="summary-card owe glass-card">
          <div className="label">You Need to Pay</div>
          <div className="amount">₹{youOweTotal}</div>
        </div>
        <div className="summary-card owed glass-card">
          <div className="label">You Will Receive</div>
          <div className="amount">₹{owedToYouTotal}</div>
        </div>
      </div>

      <div className="detailed-balances animate-fade-in-up stagger-2">
        <h3 className="section-title">Detailed Balances</h3>
        
        {balances.length > 0 ? (
          balances.map((b, i) => (
            <BalanceCard 
              key={i}
              userA={{ name: b.fromUser?.displayName || 'Unknown' }}
              userB={{ name: b.toUser?.displayName || 'Unknown' }}
              netAmount={b.amount} // If it's positive, fromUser owes toUser
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
