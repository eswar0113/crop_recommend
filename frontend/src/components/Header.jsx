import React, { useState } from 'react';
import { Sprout, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserProfileModal from './UserProfileModal';

const Header = ({ history = [] }) => {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Get initials (e.g. "Arjun Verma" -> "AV")
  const getInitials = (name) => {
    if (!name) return 'AV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user?.name);

  return (
    <>
      <header className="header-card">
        <div className="header-left">
          <div className="header-icon-box">
            <Sprout size={24} />
          </div>
          <div className="header-title-group">
            <h1>AI-Based Crop Recommendation System</h1>
            <p className="header-subtitle">
              Predict the most suitable crop from soil nutrients and environmental parameters.
            </p>
            <div className="header-badges">
              <span className="badge">Random Forest Model</span>
              <span className="badge">Node.js & Express</span>
              <span className="badge">PostgreSQL</span>
            </div>
          </div>
        </div>

        {user && (
          <div className="header-right">
            <button
              type="button"
              className="navbar-profile-btn"
              onClick={() => setIsProfileOpen(true)}
              title="Open User Profile"
            >
              <div className="navbar-avatar-box">{initials}</div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user.name}</span>
                <span className="navbar-user-tag">Agronomist</span>
              </div>
              <ChevronDown size={15} className="navbar-chevron" />
            </button>
          </div>
        )}
      </header>

      {/* User Profile Modal Popup */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        history={history}
      />
    </>
  );
};

export default Header;
