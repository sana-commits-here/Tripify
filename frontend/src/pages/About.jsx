import React from 'react';
import { Cpu, Server, Map, Database } from 'lucide-react';

export default function About() {
  return (
    <div className="page-container">
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>About Tripify</h1>
        <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
          Tripify was engineered to replace slow, rate-limited cloud AI travel assistants with a high-performance, edge-optimized architecture.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card">
            <Cpu size={24} color="#38bdf8" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>Local LLM Core</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Powered by open-weight LLMs served through Groq in the cloud, with Ollama supported for fully local inference.</p>
          </div>
          <div className="glass-card">
            <Map size={24} color="#10b981" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>Geospatial RAG</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>OpenTripMap API geocodes and retrieves real tourist attractions directly into vector chunks.</p>
          </div>
          <div className="glass-card">
            <Server size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>FastAPI Engine</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Asynchronous Python backend handling prompt generation, validation, and CORS.</p>
          </div>
          <div className="glass-card">
            <Database size={24} color="#ec4899" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>SQLite Persistence</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Automatic session management and query history stored locally.</p>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
          alt="Road trip vista"
          style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '14px', border: '1px solid #334155' }}
        />
      </div>
    </div>
  );
}