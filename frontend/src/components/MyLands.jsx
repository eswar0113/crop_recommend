import React, { useState } from 'react';
import {
  Plus,
  MapPin,
  Ruler,
  Layers,
  Sprout,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';

const MyLands = ({ lands = [], onSelectLand, onAddLand, onEditLand, onDeleteLand, loading }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
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

  const handleDeleteClick = (e, landId) => {
    e.stopPropagation();
    if (deleteConfirmId === landId) {
      onDeleteLand(landId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(landId);
    }
  };

  return (
    <div className="my-lands-container">
      {/* Top Banner & Action Row */}
      <div className="lands-header-card">
        <div className="lands-header-info">
          <div className="lands-header-icon-box">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="lands-title">My Lands</h2>
            <p className="lands-subtitle">
              Manage your agricultural plots. Select a land to record sensor data and receive personalized crop recommendations.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-add-land"
          onClick={onAddLand}
        >
          <Plus size={18} /> + Add New Land
        </button>
      </div>

      {/* Lands Grid or Empty State */}
      {lands.length === 0 ? (
        <div className="empty-lands-card">
          <div className="empty-lands-icon-box">
            <Sprout size={36} />
          </div>
          <h3 className="empty-lands-title">No lands registered yet</h3>
          <p className="empty-lands-desc">
            You haven't added any land records yet. Add your first land plot to start tracking sensor values and predicting suitable crops.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddLand}
            style={{ marginTop: '1rem' }}
          >
            <Plus size={16} /> + Add Your First Land
          </button>
        </div>
      ) : (
        <div className="lands-grid">
          {lands.map((land) => {
            const hasPrediction = !!land.latest_crop;

            return (
              <div
                key={land.id}
                className="land-card"
                onClick={() => onSelectLand(land)}
              >
                {/* Land Card Top Bar */}
                <div className="land-card-header">
                  <div className="land-card-title-box">
                    <h3 className="land-name">{land.land_name}</h3>
                    <div className="land-meta-location">
                      <MapPin size={14} className="land-icon" />
                      <span>{land.location}</span>
                    </div>
                  </div>

                  <div className="land-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="land-action-btn"
                      onClick={() => onEditLand(land)}
                      title="Edit Land"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className={`land-action-btn ${deleteConfirmId === land.id ? 'land-action-btn-danger' : ''}`}
                      onClick={(e) => handleDeleteClick(e, land.id)}
                      title={deleteConfirmId === land.id ? 'Click to confirm delete' : 'Delete Land'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {deleteConfirmId === land.id && (
                  <div className="land-delete-warning" onClick={(e) => e.stopPropagation()}>
                    <AlertCircle size={14} />
                    <span>Delete this land & all its history?</span>
                    <button
                      type="button"
                      className="btn-danger-confirm"
                      onClick={(e) => handleDeleteClick(e, land.id)}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="btn-cancel-mini"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Land Attributes */}
                <div className="land-attributes-row">
                  {land.area && (
                    <div className="land-attribute-chip">
                      <Ruler size={13} />
                      <span>{land.area}</span>
                    </div>
                  )}
                  {land.soil_type && (
                    <div className="land-attribute-chip">
                      <Layers size={13} />
                      <span>{land.soil_type}</span>
                    </div>
                  )}
                </div>

                {/* Latest Crop Recommendation & Sensor Reading */}
                <div className="land-status-box">
                  <div className="land-status-row">
                    <span className="land-status-label">Latest Crop:</span>
                    {hasPrediction ? (
                      <span className="crop-tag crop-tag-highlight">
                        {land.latest_crop}
                      </span>
                    ) : (
                      <span className="land-status-none">No prediction yet</span>
                    )}
                  </div>

                  <div className="land-status-row" style={{ marginTop: '0.4rem' }}>
                    <span className="land-status-label">
                      <Clock size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />
                      Latest Reading:
                    </span>
                    <span className="land-status-time">
                      {formatDate(land.latest_reading_time)}
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="land-card-footer">
                  <button
                    type="button"
                    className="btn-view-land"
                    onClick={() => onSelectLand(land)}
                  >
                    <span>View Land</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLands;
