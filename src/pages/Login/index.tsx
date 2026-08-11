import { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, FingerprintOutlined } from '@ant-design/icons';
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
        window.location.href = '/';
      }
    } catch (error: any) {
      message.error(error?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const username = form.getFieldValue('username');
    if (!username) {
      message.warning('Please enter your username first to use Fingerprint login.');
      return;
    }

    setBiometricLoading(true);
    try {
      // 1. Get authentication options from server
      const options = await generateWebauthnLogin(username);
      
      // 2. Pass options to browser authenticator
      const authResp = await startAuthentication(options);
      
      // 3. Verify response with server
      const verifyRes = await verifyWebauthnLogin(username, authResp);
      
      if (verifyRes && verifyRes.token && verifyRes.user) {
        message.success('Biometric login successful!');
        login(verifyRes.token, verifyRes.user);
        window.location.href = '/';
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

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} block>
              Log in
            </Button>
          </Form.Item>
          
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>OR</Divider>
          
          <Button 
            type="default" 
            icon={<FingerprintOutlined />} 
            onClick={handleBiometricLogin} 
            loading={biometricLoading}
            block
            style={{ 
              background: 'transparent', 
              color: '#00d4aa', 
              borderColor: '#00d4aa',
              marginTop: '-10px'
            }}
          >
            Login with Fingerprint
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;