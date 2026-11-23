import React, { useState, useEffect } from 'react';
import TripForm from '../components/TripForm';
import MapView from '../components/MapView';
import ChatBot from '../components/ChatBot';
import ItineraryCard from '../components/ItineraryCard';
import { generateItinerary, modifyItinerary, getTripHistory } from '../services/api';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Compass, 
  History, 
  Navigation, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  Coffee, 
  Camera, 
  UtensilsCrossed, 
  DollarSign,
  Printer,
  ChevronRight,
  Cpu
} from 'lucide-react';

export default function Planner() {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [activePoiFilter, setActivePoiFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getTripHistory();
      if (Array.isArray(data)) setHistory(data);
    } catch (err) {
      console.error('Failed to load trip history:', err);
    }
  };

  const handleGenerate = async (formData) => {
    setLoading(true);
    setSelectedDay('ALL');
    try {
      const data = await generateItinerary(formData);
      setCurrentTrip(data);
      fetchHistory();
    } catch (err) {
      alert('Error generating itinerary. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async (feedback) => {
    if (!currentTrip?.id) return;
    setModifying(true);
    try {
      const data = await modifyItinerary(currentTrip.id, feedback, currentTrip);
      setCurrentTrip((prev) => ({ ...prev, itinerary: data.itinerary }));
    } catch (err) {
      alert('Error updating itinerary.');
    } finally {
      setModifying(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleModify(promptText);
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
    setSelectedDay('ALL');
  };

  const handleCopyItinerary = () => {
    if (!currentTrip?.itinerary) return;
    navigator.clipboard.writeText(currentTrip.itinerary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Robust multi-pattern day filter for markdown generated text
  const filterItineraryByDay = (fullText, day) => {
    if (!fullText || day === 'ALL') return fullText;

    // Splits itinerary across headers like "## Day 1", "### Day 1:", "**Day 1**"
    const dayPattern = /(?:^|\n)(?=(?:#+\s*|\*{1,2})Day\s*\d+)/i;
    const sections = fullText.split(dayPattern);

    const targetSection = sections.find((sec) => {
      const match = sec.match(/Day\s*(\d+)/i);
      return match && parseInt(match[1], 10) === Number(day);
    });

    return targetSection || `### Day ${day}\nNo specific itinerary details parsed for this day. Check "Overview (All Days)" to view full output.`;
  };

  const filteredPlaces = (currentTrip?.places || []).filter((p) => {
    if (activePoiFilter === 'ALL') return true;
    return p.kinds?.toLowerCase().includes(activePoiFilter.toLowerCase());
  });

  const dayTabs = currentTrip ? Array.from({ length: currentTrip.days }, (_, i) => i + 1) : [];

  return (
    <div className="page-container" style={{ paddingBottom: '60px' }}>
      {/* Top Banner Header */}
      <div 
        className="glass-card" 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.9) 0%, rgba(9, 13, 22, 0.95) 100%)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Cpu size={13} /> Interactive Studio
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            AI Travel Studio
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time geospatial POI ingestion with local Llama 3.2 synthesis.
          </p>
        </div>

        {currentTrip && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handleCopyItinerary}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                padding: '9px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy Plan'}
            </button>

            <button
              onClick={() => window.print()}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                padding: '9px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <Printer size={15} /> Print
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Input Form, Directives & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Compass size={20} color="#38bdf8" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>Trip Parameters</h2>
            </div>
            <TripForm onGenerate={handleGenerate} loading={loading} />
          </div>

          {currentTrip && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#38bdf8" /> Quick AI Directives
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Add more local street food & cafes', icon: UtensilsCrossed },
                  { label: 'Include scenic photography spots', icon: Camera },
                  { label: 'Optimize for low-cost travel', icon: DollarSign },
                  { label: 'Make the schedule more relaxed', icon: Coffee }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(item.label)}
                      disabled={modifying}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        color: '#94a3b8',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: modifying ? 'not-allowed' : 'pointer',
                        fontSize: '0.82rem',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={14} color="#38bdf8" /> {item.label}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="#94a3b8" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Saved Plans</h3>
              </div>
              <span style={{ background: '#1e293b', color: '#94a3b8', fontSize: '0.75rem', padding: '3px 9px', borderRadius: '12px', fontWeight: 700, border: '1px solid #334155' }}>
                {history.length}
              </span>
            </div>

            {history.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No saved plans in database.
              </div>
            ) : (
              <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                {history.map((t) => {
                  const isSelected = currentTrip?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectHistoryTrip(t)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                        border: `1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
                        padding: '12px 14px',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                          {t.destination}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {t.days} Days • {t.budget || 'Moderate'}
                        </span>
                      </div>
                      {isSelected ? <CheckCircle2 size={16} color="#38bdf8" /> : <Sparkles size={14} color="#475569" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map, Day Switcher, and Filtered Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Geospatial Map */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} color="#10b981" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                  Live POI Radar
                </h3>
              </div>

              {currentTrip?.places && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['ALL', 'historic', 'cultural', 'beaches', 'religion'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActivePoiFilter(filter)}
                      style={{
                        background: activePoiFilter === filter ? '#38bdf8' : '#1e293b',
                        color: activePoiFilter === filter ? '#090d16' : '#94a3b8',
                        border: '1px solid #334155',
                        padding: '4px 10px',
                        borderRadius: '14px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <MapView places={filteredPlaces} />
          </div>

          {/* Interactive Day Selection Tabs */}
          {currentTrip && dayTabs.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
              <button
                onClick={() => setSelectedDay('ALL')}
                style={{
                  background: selectedDay === 'ALL' ? '#38bdf8' : '#1e293b',
                  color: selectedDay === 'ALL' ? '#090d16' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Overview (All Days)
              </button>
              {dayTabs.map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  style={{
                    background: selectedDay === dayNum ? '#38bdf8' : '#1e293b',
                    color: selectedDay === dayNum ? '#090d16' : '#94a3b8',
                    border: '1px solid #334155',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Day {dayNum}
                </button>
              ))}
            </div>
          )}

          {/* Dynamic Content Display */}
          {loading ? (
            <div className="glass-card pulsing-glow" style={{ padding: '54px 24px', textAlign: 'center' }}>
              <Sparkles size={40} color="#38bdf8" className="animate-spin-slow" style={{ margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                Synthesizing Itinerary...
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                Fetching verified OpenTripMap coordinates, building vector context, and prompting local Llama 3.2.
              </p>
            </div>
          ) : currentTrip ? (
            <>
              <div className="glass-card" style={{ padding: '28px' }}>
                <ItineraryCard 
                  trip={{
                    ...currentTrip,
                    itinerary: filterItineraryByDay(currentTrip.itinerary, selectedDay)
                  }} 
                />
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <ChatBot tripId={currentTrip.id} onModify={handleModify} modifying={modifying} />
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: '64px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
              <Layers size={44} color="#475569" style={{ margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                No Active Itinerary
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
                Configure your destination and preferences on the left panel to synthesize a full day-by-day itinerary with live map markers.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}