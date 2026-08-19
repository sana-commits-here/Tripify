import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Sparkles, BarChart3, Info } from 'lucide-react';

export default function Navbar() {
  return (
    <header style={{ borderBottom: '1px solid #1e293b', background: '#0f172a', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Compass size={28} color="#38bdf8" />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '-0.5px' }}>Tripify</span>
        </NavLink>

        <nav style={{ display: 'flex', gap: '8px' }}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/planner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={16} /> Planner
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={16} /> Analytics
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Info size={16} /> About
          </NavLink>
        </nav>
      </div>
    </header>
  );
}