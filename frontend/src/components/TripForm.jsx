import React, { useState } from 'react';

export default function TripForm({ onGenerate, loading }) {
  const [formData, setFormData] = useState({
    destination: 'Goa',
    days: 3,
    budget: 'Moderate',
    travel_style: 'Relaxed',
    interests: 'beaches, seafood, historical forts'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px', 
        background: '#1e293b', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #334155' 
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>Plan Your Itinerary</h2>
      
      <div>
        <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Destination</label>
        <input 
          type="text" 
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          required
          style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Days</label>
          <input 
            type="number" 
            min="1" 
            max="14" 
            value={formData.days}
            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
            style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Budget</label>
          <select 
            value={formData.budget} 
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
          >
            <option>Budget-friendly</option>
            <option>Moderate</option>
            <option>Luxury</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Travel Style</label>
        <select 
          value={formData.travel_style} 
          onChange={(e) => setFormData({ ...formData, travel_style: e.target.value })}
          style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
        >
          <option>Relaxed</option>
          <option>Fast-Paced</option>
          <option>Adventure</option>
          <option>Cultural & Heritage</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Interests & Vibes</label>
        <input 
          type="text" 
          value={formData.interests}
          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
          style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          padding: '12px', 
          background: loading ? '#64748b' : '#0284c7', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '6px', 
          fontWeight: 600, 
          cursor: loading ? 'not-allowed' : 'pointer', 
          marginTop: '8px' 
        }}
      >
        {loading ? 'Generating Itinerary...' : 'Generate Plan'}
      </button>
    </form>
  );
}