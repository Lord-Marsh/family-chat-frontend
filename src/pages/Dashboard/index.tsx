import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AutoContext';
import { getBalancesSummary, getRecentSplits } from './service';
import Header from '../../components/Header';
import SplitCard from '../../components/SplitCard';
import { Split } from '../../types';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useSocket } from '../../hooks/useSocket';
import './styles.less';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [recentSplits, setRecentSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sumRes, splitsRes] = await Promise.all([
        getBalancesSummary(),
        getRecentSplits()
      ]);
      setSummary(sumRes);
      setRecentSplits(splitsRes.splits || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to socket events for realtime update
  useSocket('split_created', fetchData);
  useSocket('settlement_updated', fetchData);
  useSocket('split_updated', fetchData);
  useSocket('split_deleted', fetchData);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return <div className="loading-center"><Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} /></div>;
  }

  const youOweTotal = summary?.youOwe?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;
  const owedToYouTotal = summary?.owedToYou?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;

  return (
    <div className="page-container dashboard">
      <Header title={`${getGreeting()}, ${user?.displayName?.split(' ')[0]}!`} />

      <div className="balance-summary animate-fade-in-up stagger-1">
        <div className="net-balance">
          <span className="label">Net Balance</span>
          <h2 className={`amount ${(summary?.netBalance || 0) > 0 ? 'positive' : (summary?.netBalance || 0) < 0 ? 'negative' : ''}`}>
            {(summary?.netBalance || 0) > 0 ? '+' : (summary?.netBalance || 0) < 0 ? '-' : ''}₹{Math.abs(summary?.netBalance || 0)}
          </h2>
        </div>

        <div className="summary-cards">
          <div className="summary-card owe glass-card">
            <div className="label">You Need to Pay</div>
            <div className="amount">₹{youOweTotal}</div>
          </div>
          <div className="summary-card owed glass-card">
            <div className="label">You Will Receive</div>
            <div className="amount">₹{owedToYouTotal}</div>
          </div>
        </div>
      </div>

      <div className="recent-splits-section animate-fade-in-up stagger-2">
        <div className="section-header">
          <h3>Recent Activity</h3>
        </div>
        
        <div className="splits-list">
          {recentSplits.length > 0 ? (
            recentSplits.map((split, index) => (
              <SplitCard key={split._id} split={split} index={index} />
            ))
          ) : (
            <div className="empty-state glass-card">
              No recent splits. Add one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
