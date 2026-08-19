import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CalendarDays, MapPin } from 'lucide-react';

export default function ItineraryCard({ trip }) {
  if (!trip?.itinerary) return null;

  return (
    <div style={{ color: '#e2e8f0', lineHeight: 1.7 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid #334155'
        }}
      >
        <CalendarDays size={22} color="#38bdf8" />
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            {trip.destination} Itinerary
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {trip.days} Days • {trip.budget || 'Custom'} Budget
          </span>
        </div>
      </div>

      <div
        className="markdown-body"
        style={{
          fontSize: '0.95rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 style={{ color: '#38bdf8', fontSize: '1.4rem', fontWeight: 800, marginTop: '16px', marginBottom: '8px' }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ color: '#38bdf8', fontSize: '1.25rem', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginTop: '12px', marginBottom: '6px' }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>{children}</p>
            ),
            ul: ({ children }) => (
              <ul style={{ paddingLeft: '20px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li style={{ color: '#cbd5e1' }}>{children}</li>
            ),
            strong: ({ children }) => (
              <strong style={{ color: '#f8fafc', fontWeight: 700 }}>{children}</strong>
            )
          }}
        >
          {trip.itinerary}
        </ReactMarkdown>
      </div>
    </div>
  );
}