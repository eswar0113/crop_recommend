import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const Notification = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {isError ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', opacity: 0.8 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Notification;
