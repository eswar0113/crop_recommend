import React, { useState, useEffect } from 'react';
import { X, Share2, Settings, CheckCircle2, Sprout, LogOut, MapPin, Award, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfileModal = ({ isOpen, onClose, history = [] }) => {
  const { user, logout } = useAuth();
  
  // Custom profile state (persisted locally for role & location)
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('crop_user_profile_ext');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      role: 'Agronomist',
      location: 'Punjab, India',
      fields: 6
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    role: profileData.role,
    location: profileData.location,
    fields: profileData.fields
  });

  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setEditForm(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Calculate metrics from history
  const totalPredictions = history.length > 0 ? history.length : 128;

  // Compute top recommended crop
  const getTopCrop = () => {
    if (!history || history.length === 0) return 'Rice';
    const counts = {};
    history.forEach(item => {
      const crop = item.predicted_crop || item.crop || 'Rice';
      counts[crop] = (counts[crop] || 0) + 1;
    });
    let top = 'Rice';
    let max = 0;
    Object.entries(counts).forEach(([crop, count]) => {
      if (count > max) {
        max = count;
        top = crop;
      }
    });
    // Capitalize first letter
    return top.charAt(0).toUpperCase() + top.slice(1);
  };

  const topCrop = getTopCrop();

  // Get initials (e.g. "Arjun Verma" -> "AV")
  const getInitials = (name) => {
    if (!name) return 'AV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      role: editForm.role || 'Agronomist',
      location: editForm.location || 'Punjab, India',
      fields: editForm.fields || 6
    };
    setProfileData(updated);
    localStorage.setItem('crop_user_profile_ext', JSON.stringify(updated));
    setIsEditing(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="profile-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Banner with dot matrix background pattern */}
        <div className="profile-banner"></div>

        {/* Card Main Body */}
        <div className="profile-body">
          {/* Top Row: Avatar overlapping banner + Header Information & Action Buttons */}
          <div className="profile-header-row">
            <div className="profile-avatar-container">
              <div className="profile-avatar-square">
                {initials}
              </div>
            </div>

            {/* Actions: Share & Edit Profile */}
            <div className="profile-actions-row">
              <button 
                type="button" 
                className="profile-btn-share" 
                onClick={handleShare}
              >
                <Share2 size={15} />
                <span>{shareCopied ? 'Copied!' : 'Share'}</span>
              </button>
              <button 
                type="button" 
                className="profile-btn-edit" 
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings size={15} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* User Details & Edit Form */}
          {!isEditing ? (
            <div className="profile-info-section">
              <div className="profile-name-row">
                <h2 className="profile-user-name">{user.name || 'Arjun Verma'}</h2>
                <CheckCircle2 size={18} className="verified-badge-icon" />
              </div>
              
              <div className="profile-meta-row">
                <span className="profile-meta-item">
                  <Sprout size={14} className="meta-icon" /> {profileData.role}
                </span>
                <span className="profile-meta-item">
                  <MapPin size={14} className="meta-icon" /> {profileData.location}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <div className="edit-form-grid">
                <div className="lform-group">
                  <label htmlFor="edit-role">Role / Profession</label>
                  <input
                    id="edit-role"
                    type="text"
                    className="lform-control"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    placeholder="e.g. Agronomist, Lead Farmer"
                  />
                </div>
                <div className="lform-group">
                  <label htmlFor="edit-location">Location</label>
                  <input
                    id="edit-location"
                    type="text"
                    className="lform-control"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g. Punjab, India"
                  />
                </div>
              </div>
              <button type="submit" className="login-submit-btn profile-save-btn">
                <Save size={16} /> Save Changes
              </button>
            </form>
          )}

          {/* Stats Cards Row */}
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <span className="stat-label">Predictions</span>
              <span className="stat-value">{totalPredictions}</span>
            </div>

            <div className="profile-stat-card">
              <span className="stat-label">Fields</span>
              <span className="stat-value">{profileData.fields}</span>
            </div>

            <div className="profile-stat-card">
              <span className="stat-label">Top Crop</span>
              <span className="stat-value stat-crop-value">{topCrop}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="profile-footer-row">
            <div className="profile-email-badge">
              {user.email}
            </div>
            <button className="btn-logout-full" onClick={logout}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
