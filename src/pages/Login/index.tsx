import { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { login as loginService, generateWebauthnLogin, verifyWebauthnLogin } from './service';
import { useAuth } from '../../contexts/AutoContext';
import { startAuthentication } from '@simplewebauthn/browser';
import './styles.less';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await loginService(values);
      if (res && res.token && res.user) {
        message.success('Welcome to SplitPay!');
        login(res.token, res.user);
        window.location.href = '/balances';
      }
    } catch (error: any) {
      message.error(error?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      // 1. Get authentication options from server
      const options = await generateWebauthnLogin();
      
      // 2. Pass options to browser authenticator
      const authResp = await startAuthentication(options);
      
      // 3. Verify response with server
      const verifyRes = await verifyWebauthnLogin(authResp);
      
      if (verifyRes && verifyRes.token && verifyRes.user) {
        message.success('Biometric login successful!');
        login(verifyRes.token, verifyRes.user);
        window.location.href = '/balances';
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        message.error('Authentication canceled or timed out.');
      } else {
        message.error(error?.data?.message || 'Fingerprint login failed. You may not have registered a device yet.');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-card animate-fade-in-up">
        <div className="brand">
          <div className="logo-icon">💸</div>
          <h1 className="logo-text">SplitPay</h1>
          <p className="tagline">Split smart. Stay even.</p>
        </div>

        <Form
          form={form}
          name="login_form"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} block>
              Log in with Password
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', margin: '24px 0' }}>OR</Divider>

        <div className="biometric-login-section">
          <div 
            className={`fingerprint-scanner ${biometricLoading ? 'scanning' : ''}`}
            onClick={!biometricLoading ? handleBiometricLogin : undefined}
          >
            <div className="scanner-ripple"></div>
            <SecurityScanOutlined className="fingerprint-icon" />
            <div className="scanner-line"></div>
          </div>
          <p className="biometric-hint">Tap to unlock with Passkey</p>
        </div>
      </div>
    </div>
  );
};

export default Login;