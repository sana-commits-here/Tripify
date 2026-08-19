import React, { useState, useEffect } from 'react';
import TripForm from '../components/TripForm';
import MapView from '../components/MapView';
import ChatBot from '../components/ChatBot';
import ItineraryCard from '../components/ItineraryCard';
import { generateItinerary, modifyItinerary, getTripHistory } from '../services/api';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modifying, setModifying] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getTripHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleGenerate = async (formData) => {
    setLoading(true);
    try {
      const data = await generateItinerary(formData);
      setCurrentTrip(data);
      fetchHistory();
    } catch (err) {
      alert('Error generating itinerary. Make sure the FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async (feedback) => {
    if (!currentTrip?.id) return;
    setModifying(true);
    try {
      const data = await modifyItinerary(currentTrip.id, feedback);
      setCurrentTrip((prev) => ({
        ...prev,
        itinerary: data.itinerary
      }));
    } catch (err) {
      alert('Error updating itinerary.');
    } finally {
      setModifying(false);
    }
  };

  const handleSelectHistoryTrip = (trip) => {
    let parsedPlaces = [];
    if (trip.places) {
      try {
        parsedPlaces = typeof trip.places === 'string' ? JSON.parse(trip.places) : trip.places;
      } catch (e) {
        parsedPlaces = [];
      }
    }
    setCurrentTrip({
      ...trip,
      places: parsedPlaces
    });
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin color="#38bdf8" size={24} />
          <div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Trips Saved</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{history.length}</p>
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar color="#10b981" size={24} />
          <div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Destination</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{currentTrip?.destination || 'None'}</p>
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock color="#f59e0b" size={24} />
          <div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Trip Duration</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              {currentTrip ? `${currentTrip.days} Days` : '0 Days'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Form & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TripForm onGenerate={handleGenerate} loading={loading} />

          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '12px' }}>
              Recent Plans
            </h3>
            {history.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No saved trips found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {history.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectHistoryTrip(t)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: currentTrip?.id === t.id ? '#334155' : '#0f172a',
                      border: '1px solid #334155',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{t.destination}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.days} Days • {t.budget || 'Moderate'}</span>
                    </div>
                    <Sparkles size={16} color="#38bdf8" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map, Cards, Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <MapView places={currentTrip?.places || []} />

          {currentTrip && (
            <>
              <ItineraryCard trip={currentTrip} />
              <ChatBot tripId={currentTrip.id} onModify={handleModify} modifying={modifying} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}