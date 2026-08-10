import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider, useAuth } from './contexts/AutoContext';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddSplit from './pages/AddSplit';
import Splits from './pages/Splits';
import SplitDetail from './pages/SplitDetail';
import Balances from './pages/Balances';
import ExpenseTracker from './pages/ExpenseTracker';
import Logs from './pages/Logs';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <div className="App">
      {children}
      {user && <BottomNav />}
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/add" element={<ProtectedRoute><Layout><AddSplit /></Layout></ProtectedRoute>} />
      <Route path="/splits" element={<ProtectedRoute><Layout><Splits /></Layout></ProtectedRoute>} />
      <Route path="/splits/:id" element={<ProtectedRoute><Layout><SplitDetail /></Layout></ProtectedRoute>} />
      <Route path="/balances" element={<ProtectedRoute><Layout><Balances /></Layout></ProtectedRoute>} />
      <Route path="/tracker" element={<ProtectedRoute><Layout><ExpenseTracker /></Layout></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><Layout><Logs /></Layout></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00d4aa',
          colorBgContainer: 'rgba(255, 255, 255, 0.06)',
          colorBgElevated: '#1f1f38',
          colorBorder: 'rgba(255, 255, 255, 0.1)',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 12,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;