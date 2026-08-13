import { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';
import './styles.less';

interface UpiPayButtonProps {
  upiId: string;
  payeeName: string;
  amount: number;
  size?: 'small' | 'large';
}

const UpiPayButton = ({ upiId, payeeName, amount, size = 'small' }: UpiPayButtonProps) => {
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=SplitPay%20Settlement`;

  useEffect(() => {
    if (showQr) {
      QRCode.toDataURL(upiString, {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [showQr, upiString]);

  const isSmall = size === 'small';

  return (
    <>
      <Button
        className="upi-pay-btn"
        size={isSmall ? 'small' : 'middle'}
        onClick={() => setShowQr(true)}
        icon={<QrcodeOutlined />}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#ffffff',
          color: '#3c4043',
          fontWeight: 600,
          fontSize: isSmall ? '12px' : '14px',
          borderRadius: isSmall ? '16px' : '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          border: '1px solid #dadce0',
        }}
      >
        {isSmall ? 'Pay via UPI' : 'Pay via UPI'}
      </Button>

      <Modal
        open={showQr}
        onCancel={() => setShowQr(false)}
        footer={null}
        centered
        width={360}
        className="upi-qr-modal"
        title={null}
      >
        <div className="upi-qr-content">
          <div className="upi-qr-header">
            <QrcodeOutlined style={{ fontSize: '24px', color: '#00e676' }} />
            <h3>Scan & Pay</h3>
          </div>

          <div className="upi-qr-details">
            <div className="upi-qr-payee">
              <span className="label">Pay to</span>
              <span className="value">{payeeName}</span>
            </div>
            <div className="upi-qr-amount">
              <span className="label">Amount</span>
              <span className="value">₹{amount}</span>
            </div>
          </div>

          {qrDataUrl && (
            <div className="upi-qr-image-wrapper">
              <img src={qrDataUrl} alt="UPI QR Code" className="upi-qr-image" />
            </div>
          )}

          <p className="upi-qr-instruction">
            Open any UPI app (GPay, PhonePe, Paytm, etc.) and scan this QR code to pay.
          </p>

          <div className="upi-qr-upiid">
            <span>UPI ID: </span>
            <strong>{upiId}</strong>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UpiPayButton;
