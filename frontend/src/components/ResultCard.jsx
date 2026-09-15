import React from 'react';
import { Sprout, CheckCircle2 } from 'lucide-react';

const ResultCard = ({ prediction, inputParams }) => {
  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header-group">
        <h2 className="card-title">Prediction Result</h2>
        <p className="card-subtitle">Recommended crop based on the current inputs.</p>
      </div>

      {!prediction ? (
        <div className="result-dashed-box">
          <div className="result-icon-circle">
            <Sprout size={22} />
          </div>
          <div className="result-empty-title">No prediction yet.</div>
          <div className="result-empty-desc">
            Fill in the parameters and select <strong>Predict Crop</strong> to see a recommendation.
          </div>
        </div>
      ) : (
        <div>
          <div className="result-active-box">
            <div className="result-active-label">Optimal Crop Recommendation</div>
            <div className="result-crop-display">{prediction}</div>
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
              <CheckCircle2 size={16} /> Random Forest Model Verdict
            </div>
          </div>

          {inputParams && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 600 }}>
                Input Parameters Summary:
              </h4>
              <div className="params-grid">
                <div className="param-card">
                  <div className="param-label">Nitrogen (N)</div>
                  <div className="param-val">{inputParams.N} <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>kg/ha</span></div>
                </div>
                <div className="param-card">
                  <div className="param-label">Phosphorus (P)</div>
                  <div className="param-val">{inputParams.P} <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>kg/ha</span></div>
                </div>
                <div className="param-card">
                  <div className="param-label">Potassium (K)</div>
                  <div className="param-val">{inputParams.K} <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>kg/ha</span></div>
                </div>
                <div className="param-card">
                  <div className="param-label">Temperature</div>
                  <div className="param-val">{inputParams.temperature} <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>°C</span></div>
                </div>
                <div className="param-card">
                  <div className="param-label">Humidity</div>
                  <div className="param-val">{inputParams.humidity} <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>%</span></div>
                </div>
                <div className="param-card">
                  <div className="param-label">Soil pH</div>
                  <div className="param-val">{inputParams.ph}</div>
                </div>
                <div className="param-card">
                  <div className="param-label">Rainfall</div>
                  <div className="param-val">{inputParams.rainfall} <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>mm</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
