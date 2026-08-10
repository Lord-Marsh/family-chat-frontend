import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tabs, List, Typography, Spin, message, Tag } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpOutlined, WalletOutlined, TransactionOutlined } from '@ant-design/icons';
import request from '../utils/request';
import Header from '../components/Header';
import './ExpenseTracker.css';

const { Title, Text } = Typography;

interface Overview {
  personalTotal: number;
  groupTotal: number;
  totalTransactions: number;
}

interface ChartData {
  name?: string;
  value?: number;
  date?: string;
  month?: string;
  week?: string;
  amount?: number;
}

interface TopExpense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

interface AnalyticsData {
  overview: Overview;
  categories: ChartData[];
  daily: ChartData[];
  weekly: ChartData[];
  monthly: ChartData[];
  topExpenses: TopExpense[];
}

const COLORS = ['#00d4aa', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#10b981'];

const ExpenseTracker = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await request.get('/api/analytics');
      setData(res);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', color: 'rgba(255,255,255,0.5)' }}>
        <p>No analytics data available or an error occurred.</p>
      </div>
    );
  }

  const renderAreaChart = (chartData: ChartData[], xAxisKey: string) => (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
          <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
          <RechartsTooltip 
            contentStyle={{ backgroundColor: '#1f1f38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
            itemStyle={{ color: '#00d4aa' }}
          />
          <Area type="monotone" dataKey="amount" stroke="#00d4aa" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const tabItems = [
    {
      key: 'daily',
      label: 'Daily',
      children: renderAreaChart(data.daily, 'date'),
    },
    {
      key: 'weekly',
      label: 'Weekly',
      children: renderAreaChart(data.weekly, 'week'),
    },
    {
      key: 'monthly',
      label: 'Monthly',
      children: renderAreaChart(data.monthly, 'month'),
    }
  ];

  return (
    <div className="page-container expense-tracker">
      <Header title="Expense Tracker" />
      
      <div className="scroll-content pb-24">
        {/* KPI Overview */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={12}>
            <Card className="glass-card stat-card" bordered={false}>
              <Statistic
                title={<span className="stat-title">Personal Spent</span>}
                value={data.overview.personalTotal}
                precision={2}
                valueStyle={{ color: '#00d4aa' }}
                prefix={<WalletOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="glass-card stat-card" bordered={false}>
              <Statistic
                title={<span className="stat-title">Group Total</span>}
                value={data.overview.groupTotal}
                precision={2}
                valueStyle={{ color: '#fff' }}
                prefix={<TransactionOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Trends Chart */}
        <Card className="glass-card mb-4" bordered={false}>
          <Title level={5} className="section-title">Spending Trends</Title>
          <Tabs defaultActiveKey="monthly" items={tabItems} className="custom-tabs" />
        </Card>

        {/* Category Breakdown */}
        <Card className="glass-card mb-4" bordered={false}>
          <Title level={5} className="section-title">Expense by Category</Title>
          {data.categories.length > 0 ? (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1f1f38', border: 'none', borderRadius: 8 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">No category data available</div>
          )}
        </Card>

        {/* High Expenses Alert */}
        <Card className="glass-card" bordered={false}>
          <Title level={5} className="section-title text-danger">
            <ArrowUpOutlined /> Top Drivers of Expense
          </Title>
          <Text type="secondary" className="mb-4 block">Here is what drove your expenses the highest recently.</Text>
          <List
            itemLayout="horizontal"
            dataSource={data.topExpenses}
            renderItem={(item) => (
              <List.Item className="expense-list-item">
                <List.Item.Meta
                  title={<span className="text-white">{item.description}</span>}
                  description={
                    <span className="text-secondary">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  }
                />
                <div className="expense-amount-wrapper">
                  <Tag color="error" className="amount-tag">
                    ₹{item.amount.toFixed(2)}
                  </Tag>
                  <Text type="secondary" className="block text-right text-xs mt-1">{item.category}</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default ExpenseTracker;
