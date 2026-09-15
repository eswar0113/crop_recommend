import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import HistoryTable from './components/HistoryTable';
import Notification from './components/Notification';
import MyLands from './components/MyLands';
import AddLandModal from './components/AddLandModal';
import {
  getLands,
  createLand,
  updateLand,
  deleteLand,
  predictCrop,
  getHistory,
  deleteHistory
} from './services/api';
import { ArrowLeft, MapPin, Ruler, Layers } from 'lucide-react';

function Dashboard() {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [lastInputParams, setLastInputParams] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddLandModalOpen, setIsAddLandModalOpen] = useState(false);
  const [editingLand, setEditingLand] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'error' });

  // Fetch all lands
  const fetchLandsData = async () => {
    try {
      const data = await getLands();
      if (data && data.success) {
        setLands(data.lands || []);
        if (selectedLand) {
          const updated = (data.lands || []).find((l) => l.id === selectedLand.id);
          if (updated) setSelectedLand(updated);
        }
      }
    } catch (err) {
      console.warn('Could not fetch lands:', err.message);
    }
  };

  // Fetch history for selected land
  const fetchHistoryData = async (landId) => {
    try {
      const data = await getHistory(landId);
      if (data && data.success) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.warn('Could not fetch prediction history:', err.message);
    }
  };

  useEffect(() => {
    fetchLandsData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingLand(null);
    setIsAddLandModalOpen(true);
  };

  const handleOpenEditModal = (land) => {
    setEditingLand(land);
    setIsAddLandModalOpen(true);
  };

  const handleCreateOrUpdateLand = async (formData) => {
    setLoading(true);
    setNotification({ message: '', type: 'error' });
    try {
      let res;
      if (editingLand) {
        res = await updateLand(editingLand.id, formData);
      } else {
        res = await createLand(formData);
      }

      if (res && res.success) {
        setNotification({
          message: editingLand ? 'Land details updated successfully.' : 'New land plot registered successfully!',
          type: 'success'
        });
        setIsAddLandModalOpen(false);
        setEditingLand(null);
        await fetchLandsData();
      } else {
        setNotification({ message: res.error || 'Failed to save land details.', type: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error saving land details.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLand = async (landId) => {
    setLoading(true);
    try {
      const res = await deleteLand(landId);
      if (res && res.success) {
        setNotification({ message: 'Land and associated records deleted.', type: 'success' });
        if (selectedLand && selectedLand.id === landId) {
          setSelectedLand(null);
        }
        await fetchLandsData();
      } else {
        setNotification({ message: res.error || 'Failed to delete land.', type: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error deleting land.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLand = async (land) => {
    setSelectedLand(land);
    setCurrentPrediction(null);
    setLastInputParams(null);
    await fetchHistoryData(land.id);
  };

  const handleBackToLands = () => {
    setSelectedLand(null);
    fetchLandsData();
  };

  const handlePredict = async (formData) => {
    if (!selectedLand) {
      setNotification({ message: 'Please select a land first.', type: 'error' });
      return;
    }

    setLoading(true);
    setNotification({ message: '', type: 'error' });
    try {
      const res = await predictCrop({
        ...formData,
        land_id: selectedLand.id
      });

      if (res && res.success) {
        setCurrentPrediction(res.predicted_crop);
        setLastInputParams(formData);
        setNotification({
          message: `Prediction successful for ${selectedLand.land_name}! Recommended Crop: ${res.predicted_crop.toUpperCase()}`,
          type: 'success'
        });
        await fetchHistoryData(selectedLand.id);
        await fetchLandsData();
      } else {
        setNotification({ message: res.error || 'Failed to obtain prediction.', type: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error communicating with backend API.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedLand) return;
    setLoading(true);
    try {
      const res = await deleteHistory(selectedLand.id);
      if (res && res.success) {
        setHistory([]);
        setNotification({ message: `History cleared for ${selectedLand.land_name}.`, type: 'success' });
        await fetchLandsData();
      } else {
        setNotification({ message: res.error || 'Failed to clear history.', type: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error clearing history.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header history={history} />

      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'error' })}
        />
      )}

      <main>
        {!selectedLand ? (
          <MyLands
            lands={lands}
            onSelectLand={handleSelectLand}
            onAddLand={handleOpenAddModal}
            onEditLand={handleOpenEditModal}
            onDeleteLand={handleDeleteLand}
            loading={loading}
          />
        ) : (
          <div className="land-dashboard-container">
            {/* Selected Land Header Banner */}
            <div className="selected-land-banner">
              <div className="selected-land-left">
                <button
                  type="button"
                  className="btn-back-lands"
                  onClick={handleBackToLands}
                >
                  <ArrowLeft size={16} /> Back to My Lands
                </button>

                <div className="selected-land-info-group">
                  <div className="selected-land-badge-row">
                    <h2 className="selected-land-name">{selectedLand.land_name}</h2>
                    <span className="selected-land-tag">Selected Land</span>
                  </div>
                  <div className="selected-land-meta-p">
                    <span>
                      <MapPin size={13} style={{ display: 'inline', marginRight: '0.2rem' }} />
                      {selectedLand.location}
                    </span>
                    {selectedLand.area && (
                      <span>
                        <Ruler size={13} style={{ display: 'inline', marginRight: '0.2rem' }} />
                        {selectedLand.area}
                      </span>
                    )}
                    {selectedLand.soil_type && (
                      <span>
                        <Layers size={13} style={{ display: 'inline', marginRight: '0.2rem' }} />
                        {selectedLand.soil_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Switch Dropdown */}
              {lands.length > 1 && (
                <div className="land-selector-box">
                  <span className="land-selector-label">Switch Land:</span>
                  <select
                    className="land-select-dropdown"
                    value={selectedLand.id}
                    onChange={(e) => {
                      const targetLand = lands.find((l) => l.id === parseInt(e.target.value, 10));
                      if (targetLand) handleSelectLand(targetLand);
                    }}
                  >
                    {lands.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.land_name} ({l.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Land Dashboard Prediction & History Components */}
            <div style={{ marginTop: '1.5rem' }}>
              <PredictionForm onSubmit={handlePredict} loading={loading} />
              <ResultCard prediction={currentPrediction} inputParams={lastInputParams} />
              <HistoryTable
                history={history}
                onClearHistory={handleClearHistory}
                loading={loading}
              />
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Land Modal */}
      <AddLandModal
        isOpen={isAddLandModalOpen}
        onClose={() => {
          setIsAddLandModalOpen(false);
          setEditingLand(null);
        }}
        onSubmit={handleCreateOrUpdateLand}
        initialLand={editingLand}
        loading={loading}
      />

      <footer className="footer-text">
        AI-Based Crop Recommendation System · Random Forest · Node.js & Express · PostgreSQL
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
