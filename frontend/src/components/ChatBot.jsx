import React, { useState } from 'react';

export default function ChatBot({ tripId, onModify, modifying }) {
  const [feedback, setFeedback] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!feedback.trim() || !tripId) return;
    onModify(feedback);
    setFeedback('');
  };

  return (
    <div style={{ background: '#1e293b', padding: '18px', borderRadius: '12px', border: '1px solid #334155', marginTop: '16px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#f8fafc' }}>Modify Itinerary with AI</h3>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="e.g., Replace Day 2 afternoon with shopping and cafes..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={!tripId || modifying}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
        />
        <button 
          type="submit" 
          disabled={!tripId || modifying}
          style={{ 
            padding: '10px 18px', 
            background: modifying ? '#64748b' : '#10b981', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            fontWeight: 600, 
            cursor: modifying ? 'not-allowed' : 'pointer' 
          }}
        >
          {modifying ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
}