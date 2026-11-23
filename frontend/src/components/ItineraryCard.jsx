import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CalendarDays } from 'lucide-react';

// Older saved itineraries may contain HTML line breaks inside table cells.
const cleanMarkdown = (text) => text.replace(/<br\s*\/?>/gi, ' · ');

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

      <div className="itinerary-md">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="itinerary-table-wrap">
                <table>{children}</table>
              </div>
            )
          }}
        >
          {cleanMarkdown(trip.itinerary)}
        </ReactMarkdown>
      </div>
    </div>
  );
}
