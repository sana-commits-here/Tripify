import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Map, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center', minHeight: '65vh' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
            <Sparkles size={14} /> Next-Gen AI Travel Engine
          </span>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, color: '#f8fafc', marginBottom: '18px' }}>
            Craft Smarter Journeys with <span style={{ color: '#38bdf8' }}>Local AI</span>.
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Tripify blends offline Retrieval-Augmented Generation with OpenTripMap geospatial data to generate tailored itineraries, live route maps, and budget forecasts instantly.
          </p>
          <button
            onClick={() => navigate('/planner')}
            style={{ padding: '14px 28px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(2, 132, 199, 0.39)' }}
          >
            Start Planning <Sparkles size={18} />
          </button>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80"
            alt="Travel Adventure"
            style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '18px', border: '1px solid #334155', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
          />
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '48px' }}>
        <div className="glass-card">
          <Zap color="#38bdf8" size={32} style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Llama 3.2 Intelligence</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Low-latency itinerary creation with Llama 3 on Groq, or fully local through Ollama.</p>
        </div>
        <div className="glass-card">
          <Map color="#10b981" size={32} style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Live OpenTripMap POIs</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Real coordinates and verified tourist hotspots mapped out directly with interactive Leaflet tiles.</p>
        </div>
        <div className="glass-card">
          <ShieldCheck color="#f59e0b" size={32} style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Conversational Updates</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>Refine your itinerary on the fly with natural language instructions without restarting your session.</p>
        </div>
      </div>
    </div>
  );
}