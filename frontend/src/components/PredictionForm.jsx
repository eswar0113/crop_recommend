import React, { useState } from 'react';
import { Send, RotateCcw } from 'lucide-react';

const SAMPLES = [
  { name: 'Rice', N: 90, P: 42, K: 43, temperature: 25.5, humidity: 80, ph: 6.5, rainfall: 200 },
  { name: 'Maize', N: 75, P: 45, K: 20, temperature: 22.0, humidity: 65, ph: 6.2, rainfall: 85 },
  { name: 'Cotton', N: 120, P: 45, K: 20, temperature: 24.5, humidity: 80, ph: 7.2, rainfall: 75 },
  { name: 'Coffee', N: 100, P: 28, K: 30, temperature: 25.0, humidity: 60, ph: 6.8, rainfall: 150 }
];

const PredictionForm = ({ onSubmit, loading }) => {
  const initialValues = {
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  };

  const [formData, setFormData] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData(initialValues);
  };

  const handleLoadSample = (sample) => {
    setFormData({
      N: sample.N.toString(),
      P: sample.P.toString(),
      K: sample.K.toString(),
      temperature: sample.temperature.toString(),
      humidity: sample.humidity.toString(),
      ph: sample.ph.toString(),
      rainfall: sample.rainfall.toString()
    });
  };

  return (
    <div className="card">
      <div className="card-header-group">
        <h2 className="card-title">Input Parameters</h2>
        <p className="card-subtitle">Enter soil and climate readings to run a prediction.</p>
      </div>

      {/* Preset Buttons */}
      <div className="presets-row">
        <span className="presets-label">Sample presets:</span>
        {SAMPLES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            className="btn-preset"
            onClick={() => handleLoadSample(sample)}
          >
            {sample.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Nitrogen (N) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="N">Nitrogen (N)</label>
              <span className="unit-label">kg/ha</span>
            </div>
            <input
              type="number"
              id="N"
              name="N"
              className="form-control"
              placeholder="0"
              min="0"
              max="200"
              step="any"
              required
              value={formData.N}
              onChange={handleChange}
            />
          </div>

          {/* Phosphorus (P) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="P">Phosphorus (P)</label>
              <span className="unit-label">kg/ha</span>
            </div>
            <input
              type="number"
              id="P"
              name="P"
              className="form-control"
              placeholder="0"
              min="0"
              max="200"
              step="any"
              required
              value={formData.P}
              onChange={handleChange}
            />
          </div>

          {/* Potassium (K) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="K">Potassium (K)</label>
              <span className="unit-label">kg/ha</span>
            </div>
            <input
              type="number"
              id="K"
              name="K"
              className="form-control"
              placeholder="0"
              min="0"
              max="250"
              step="any"
              required
              value={formData.K}
              onChange={handleChange}
            />
          </div>

          {/* Temperature */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="temperature">Temperature</label>
              <span className="unit-label">°C</span>
            </div>
            <input
              type="number"
              id="temperature"
              name="temperature"
              className="form-control"
              placeholder="0"
              min="-10"
              max="60"
              step="any"
              required
              value={formData.temperature}
              onChange={handleChange}
            />
          </div>

          {/* Humidity */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="humidity">Humidity</label>
              <span className="unit-label">%</span>
            </div>
            <input
              type="number"
              id="humidity"
              name="humidity"
              className="form-control"
              placeholder="0"
              min="0"
              max="100"
              step="any"
              required
              value={formData.humidity}
              onChange={handleChange}
            />
          </div>

          {/* Soil pH */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="ph">Soil pH</label>
              <span className="unit-label">0 – 14</span>
            </div>
            <input
              type="number"
              id="ph"
              name="ph"
              className="form-control"
              placeholder="0"
              min="0"
              max="14"
              step="any"
              required
              value={formData.ph}
              onChange={handleChange}
            />
          </div>

          {/* Rainfall */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="rainfall">Rainfall</label>
              <span className="unit-label">mm</span>
            </div>
            <input
              type="number"
              id="rainfall"
              name="rainfall"
              className="form-control"
              placeholder="0"
              min="0"
              max="500"
              step="any"
              required
              value={formData.rainfall}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Predicting...
              </>
            ) : (
              <>
                <Send size={16} /> Predict Crop
              </>
            )}
          </button>

          <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;
