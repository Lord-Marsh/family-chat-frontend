import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, Table, DatePicker, Button } from 'antd';
import { useAuth } from '../../contexts/AutoContext';
import Header from '../../components/Header';
import { getLoginLogs, getEmailLogs, getActivityLogs } from './service';
import './styles.less';

const { RangePicker } = DatePicker;

const Logs = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  if (user?.userType !== 'sa') {
    return <Navigate to="/" replace />;
  }

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'login') res = await getLoginLogs(page);
      else if (activeTab === 'email') res = await getEmailLogs(page);
      else res = await getActivityLogs(page);
      
      setData(res.items || []);
      setPagination({
        ...pagination,
        current: page,
        total: res.total || 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [activeTab]);

  const columnsMap: any = {
    login: [
      { title: 'User', dataIndex: 'userId', key: 'user' },
      { title: 'Action', dataIndex: 'action', key: 'action' },
      { title: 'IP', dataIndex: 'ip', key: 'ip' },
      { title: 'Time', dataIndex: 'timestamp', key: 'time', render: (t: string) => new Date(t).toLocaleString('en-IN') }
    ],
    email: [
      { title: 'To', dataIndex: 'to', key: 'to' },
      { title: 'Subject', dataIndex: 'subject', key: 'subject' },
      { title: 'Status', dataIndex: 'status', key: 'status' },
      { title: 'Time', dataIndex: 'timestamp', key: 'time', render: (t: string) => new Date(t).toLocaleString('en-IN') }
    ],
    activity: [
      { title: 'User', dataIndex: 'userId', key: 'user' },
      { title: 'Action', dataIndex: 'action', key: 'action' },
      { title: 'Details', dataIndex: 'details', key: 'details' },
      { title: 'Time', dataIndex: 'timestamp', key: 'time', render: (t: string) => new Date(t).toLocaleString('en-IN') }
    ]
  };

  return (
    <div className="page-container logs-page">
      <Header title="System Logs" />
      
      <div className="logs-container glass-card animate-fade-in-up">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: 'login', label: 'Login Logs' },
            { key: 'email', label: 'Email Logs' },
            { key: 'activity', label: 'Activity Logs' }
          ]}
        />
        
        <div className="filters" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <RangePicker style={{ flex: 1 }} />
          <Button type="primary" onClick={() => fetchData(1)}>Apply</Button>
        </div>

        <div className="table-wrapper">
          <Table 
            columns={columnsMap[activeTab]} 
            dataSource={data}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (page) => fetchData(page)
            }}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Logs;
