import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login as loginService } from './service';
import { useAuth } from '../../contexts/AutoContext';
import './styles.less';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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

  return (
    <div className="login-container">
      <div className="login-box glass-card animate-fade-in-up">
        <div className="brand">
          <div className="logo-icon">💸</div>
          <h1 className="logo-text">SplitPay</h1>
          <p className="tagline">Split smart. Stay even.</p>
        </div>

        <Form
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
        </Form>
      </div>
    </div>
  );
};

export default Login;