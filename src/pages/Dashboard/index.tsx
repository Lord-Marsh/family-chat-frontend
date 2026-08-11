import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AutoContext';
import { getBalancesSummary, getRecentSplits, generateWebauthnRegistration, verifyWebauthnRegistration } from './service';
import Header from '../../components/Header';
import SplitCard from '../../components/SplitCard';
import type { Split } from '../../types';
import { Spin, Button, message } from 'antd';
import { LoadingOutlined, FingerprintOutlined } from '@ant-design/icons';
import { useSocket } from '../../hooks/useSocket';
import { startRegistration } from '@simplewebauthn/browser';
import './styles.less';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [recentSplits, setRecentSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

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

  const handleSetupFingerprint = async () => {
    setRegistering(true);
    try {
      // 1. Get registration options from server
      const options = await generateWebauthnRegistration();
      
      // 2. Pass options to browser authenticator
      const regResp = await startRegistration(options);
      
      // 3. Verify response with server
      await verifyWebauthnRegistration(regResp);
      
      message.success('Fingerprint login setup successful! You can now use it to log in.');
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        message.error('Fingerprint registration canceled or timed out.');
      } else {
        message.error(error?.data?.message || 'Failed to setup fingerprint. Your browser may not support it.');
      }
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="loading-center"><Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} /></div>;
  }

  const youOweTotal = summary?.youOwe?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;
  const owedToYouTotal = summary?.owedToYou?.reduce((acc: number, val: any) => acc + val.amount, 0) || 0;

  return (
    <div className="page-container dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header title={`${getGreeting()}, ${user?.displayName?.split(' ')[0]}!`} />
        <Button 
          type="dashed" 
          icon={<FingerprintOutlined />} 
          onClick={handleSetupFingerprint} 
          loading={registering}
          style={{ borderColor: '#00d4aa', color: '#00d4aa', background: 'transparent' }}
        >
          Setup Fingerprint
        </Button>
      </div>

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
