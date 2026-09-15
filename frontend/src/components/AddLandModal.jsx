import React, { useState, useEffect } from 'react';
import { X, MapPin, Layers, Ruler, Tag, Plus, Check } from 'lucide-react';

const SOIL_OPTIONS = [
  'Clay',
  'Loam',
  'Sandy',
  'Silt',
  'Black Soil',
  'Red Soil',
  'Alluvial',
  'Peat / Marshy',
  'Saline'
];

const AddLandModal = ({ isOpen, onClose, onSubmit, initialLand = null, loading = false }) => {
  const [formData, setFormData] = useState({
    land_name: '',
    location: '',
    area: '',
    soil_type: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialLand) {
      setFormData({
        land_name: initialLand.land_name || '',
        location: initialLand.location || '',
        area: initialLand.area || '',
        soil_type: initialLand.soil_type || ''
      });
    } else {
      setFormData({
        land_name: '',
        location: '',
        area: '',
        soil_type: ''
      });
    }
    setErrors({});
  }, [initialLand, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.land_name.trim()) {
      newErrors.land_name = 'Land name is required.';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="land-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="profile-modal-close" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <div className="land-modal-header">
          <div className="land-modal-icon-box">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="land-modal-title">
              {initialLand ? 'Edit Land Details' : 'Add New Land'}
            </h2>
            <p className="land-modal-subtitle">
              {initialLand
                ? 'Update land parameters and location information.'
                : 'Register a new land plot to link sensor readings & crop recommendations.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="land-modal-form">
          {/* Land Name (Required) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="land_name">
                Land Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span className="unit-label">e.g. North Field Plot A</span>
            </div>
            <div className="input-icon-wrapper">
              <Tag size={16} className="input-field-icon" />
              <input
                type="text"
                id="land_name"
                name="land_name"
                className={`form-control ${errors.land_name ? 'form-control-error' : ''}`}
                placeholder="Enter land name"
                value={formData.land_name}
                onChange={handleChange}
                autoFocus
              />
            </div>
            {errors.land_name && <span className="field-error-msg">{errors.land_name}</span>}
          </div>

          {/* Location (Required) */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="location">
                Location <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span className="unit-label">District / Village / Coordinates</span>
            </div>
            <div className="input-icon-wrapper">
              <MapPin size={16} className="input-field-icon" />
              <input
                type="text"
                id="location"
                name="location"
                className={`form-control ${errors.location ? 'form-control-error' : ''}`}
                placeholder="e.g. Nashik, Sector 4"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            {errors.location && <span className="field-error-msg">{errors.location}</span>}
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Area (Optional) */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="area">Area (Optional)</label>
                <span className="unit-label">acres / ha</span>
              </div>
              <div className="input-icon-wrapper">
                <Ruler size={16} className="input-field-icon" />
                <input
                  type="text"
                  id="area"
                  name="area"
                  className="form-control"
                  placeholder="e.g. 4.5 Acres"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Soil Type (Optional) */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="soil_type">Soil Type (Optional)</label>
              </div>
              <select
                id="soil_type"
                name="soil_type"
                className="form-control"
                value={formData.soil_type}
                onChange={handleChange}
              >
                <option value="">-- Select Soil Type --</option>
                {SOIL_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="button-group" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : initialLand ? (
                <>
                  <Check size={16} /> Update Land
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Land
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLandModal;
