import React, { useState } from 'react';
import { History, Trash2 } from 'lucide-react';

const HistoryTable = ({ history, onClearHistory, loading }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleClearClick = () => {
    if (showConfirm) {
      onClearHistory();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="history-header-row">
        <div className="history-title-box">
          <History size={18} color="var(--accent-primary)" />
          <h2 className="card-title" style={{ margin: 0 }}>Prediction History</h2>
          <span className="pill-count">
            {history.length} record{history.length !== 1 ? 's' : ''}
          </span>
        </div>

        {history.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showConfirm && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                Are you sure?
              </span>
            )}
            <button
              className="btn-danger-outline"
              onClick={handleClearClick}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Trash2 size={14} />
              {showConfirm ? 'Confirm Clear' : 'Clear History'}
            </button>
            {showConfirm && (
              <button
                className="btn btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="history-empty-box">
          No predictions recorded yet.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>Recommended Crop</th>
                <th>N</th>
                <th>P</th>
                <th>K</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>pH</th>
                <th>Rainfall (mm)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td style={{ color: 'var(--text-sub)' }}>{row.id || idx + 1}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {formatDate(row.created_at)}
                  </td>
                  <td>
                    <span className="crop-tag">{row.predicted_crop}</span>
                  </td>
                  <td>{row.n !== undefined ? row.n : row.N}</td>
                  <td>{row.p !== undefined ? row.p : row.P}</td>
                  <td>{row.k !== undefined ? row.k : row.K}</td>
                  <td>{row.temperature}</td>
                  <td>{row.humidity}</td>
                  <td>{row.ph}</td>
                  <td>{row.rainfall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
