import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Radio, Button, Checkbox, message, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { getCategories, getUsers, createSplit } from './service';
import type { Category, User } from '../../types';
import './styles.less';

const AddSplit = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [splitType, setSplitType] = useState<'equal'|'custom'>('equal');

  const totalAmount = Form.useWatch('totalAmount', form);
  const selectedSplitAmong = Form.useWatch('splitAmongSelected', form) || [];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, usrRes] = await Promise.all([getCategories(), getUsers()]);
        setCategories(catRes);
        setUsers(usrRes);
      } catch (error) {
        console.error(error);
        message.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      const payload = {
        description: values.description,
        totalAmount: values.totalAmount,
        category: values.category,
        splitType: values.splitType,
        paidBy: values.paidBySelected.map((userId: string) => ({
          userId,
          amount: values.paidByAmount?.[userId] || 0
        })),
        splitAmong: values.splitAmongSelected.map((userId: string) => ({
          userId,
          share: splitType === 'equal' 
            ? (values.totalAmount / values.splitAmongSelected.length)
            : (values.splitAmongShare?.[userId] || 0)
        }))
      };

      // Validation
      const totalPaid = payload.paidBy.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (Math.abs(totalPaid - payload.totalAmount) > 0.1) {
        return message.error(`Total paid amount (₹${totalPaid}) must equal total amount (₹${payload.totalAmount})`);
      }

      if (splitType === 'custom') {
        const totalSplit = payload.splitAmong.reduce((sum: number, s: any) => sum + s.share, 0);
        if (Math.abs(totalSplit - payload.totalAmount) > 0.1) {
          return message.error(`Total split amount (₹${totalSplit}) must equal total amount (₹${payload.totalAmount})`);
        }
      }

      await createSplit(payload);
      message.success('Split created successfully!');
      navigate('/splits');
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to create split');
    } finally {
      setLoading(false);
    }
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    // 1. If paidBySelected changes
    if (changedValues.paidBySelected) {
      const selected = changedValues.paidBySelected;
      if (selected.length === 1 && allValues.totalAmount) {
        form.setFieldValue(['paidByAmount', selected[0]], allValues.totalAmount);
      } else if (selected.length > 1) {
        selected.forEach((id: string) => {
          form.setFieldValue(['paidByAmount', id], null);
        });
      }
    }

    // 2. Auto-fill the other person if exactly 2 are selected
    if (changedValues.paidByAmount && allValues.totalAmount && allValues.paidBySelected?.length === 2) {
      const changedUserId = Object.keys(changedValues.paidByAmount)[0];
      const typedAmount = changedValues.paidByAmount[changedUserId] || 0;
      
      const otherUserId = allValues.paidBySelected.find((id: string) => id !== changedUserId);
      if (otherUserId) {
        const remaining = Math.max(0, allValues.totalAmount - typedAmount);
        form.setFieldValue(['paidByAmount', otherUserId], Number(remaining.toFixed(2)));
      }
    }
  };

  return (
    <div className="page-container add-split">
      <Header title="New Split" />
      
      <div className="form-container glass-card animate-fade-in-up">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          initialValues={{ splitType: 'equal' }}
          size="large"
        >
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input placeholder="What was this for?" />
          </Form.Item>

          <Form.Item name="totalAmount" label="Total Amount" rules={[{ required: true }]}>
            <InputNumber prefix="₹" style={{ width: '100%' }} placeholder="0.00" min={1} />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select 
              placeholder="Select a category"
              options={categories.map(c => ({
                value: c._id,
                label: `${c.icon} ${c.name}`
              }))}
            />
          </Form.Item>

          <div className="section-divider" />

          <Form.Item name="paidBySelected" label="Who paid?" rules={[{ required: true, message: 'Select at least one' }]}>
            <Checkbox.Group className="user-checkbox-group">
              {users.map(u => (
                <Checkbox key={u.id} value={u.id} className="user-checkbox">
                  <Avatar size="small" className="avatar">{u.displayName.charAt(0)}</Avatar>
                  {u.displayName}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.paidBySelected !== curr.paidBySelected}>
            {() => {
              const selected = form.getFieldValue('paidBySelected') || [];
              if (selected.length === 0) return null;

              return (
                <div className="amount-inputs">
                  {selected.map((userId: string) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <Form.Item key={userId} name={['paidByAmount', userId]} label={`${user?.displayName} paid:`} rules={[{ required: true }]}>
                        <InputNumber prefix="₹" style={{ width: '100%' }} min={0} />
                      </Form.Item>
                    );
                  })}
                </div>
              );
            }}
          </Form.Item>

          <div className="section-divider" />

          <Form.Item name="splitType" label="Split Type">
            <Radio.Group onChange={(e) => setSplitType(e.target.value)} buttonStyle="solid" className="split-type-group">
              <Radio.Button value="equal">Equal</Radio.Button>
              <Radio.Button value="custom">Custom</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="splitAmongSelected" label="Split among" rules={[{ required: true }]}>
            <Checkbox.Group className="user-checkbox-group">
              {users.map(u => (
                <Checkbox key={u.id} value={u.id} className="user-checkbox">
                  <Avatar size="small" className="avatar">{u.displayName.charAt(0)}</Avatar>
                  {u.displayName}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>

          {splitType === 'equal' && selectedSplitAmong.length > 0 && totalAmount && (
            <div className="equal-preview">
              Each pays: <span className="highlight">₹{(totalAmount / selectedSplitAmong.length).toFixed(2)}</span>
            </div>
          )}

          {splitType === 'custom' && (
            <Form.Item shouldUpdate={(prev, curr) => prev.splitAmongSelected !== curr.splitAmongSelected}>
              {() => {
                const selected = form.getFieldValue('splitAmongSelected') || [];
                return (
                  <div className="amount-inputs">
                    {selected.map((userId: string) => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <Form.Item key={userId} name={['splitAmongShare', userId]} label={`${user?.displayName}'s share:`} rules={[{ required: true }]}>
                          <InputNumber prefix="₹" style={{ width: '100%' }} min={0} />
                        </Form.Item>
                      );
                    })}
                  </div>
                );
              }}
            </Form.Item>
          )}

          <Form.Item className="submit-section">
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Add Expense
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddSplit;
