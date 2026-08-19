import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function Analytics() {
  const budgetBreakdown = {
    labels: ['Accommodation', 'Food & Dining', 'Transportation', 'Attractions & Activities'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#ec4899'],
        borderWidth: 0
      }
    ]
  };

  const popularityData = {
    labels: ['Goa', 'Manali', 'Kyoto', 'Rome', 'Dubai', 'Bali'],
    datasets: [
      {
        label: 'Generated Queries',
        data: [65, 48, 80, 55, 72, 90],
        backgroundColor: '#0284c7',
        borderRadius: 6
      }
    ]
  };

  const costTrendData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [
      {
        label: 'Average Daily Cost ($)',
        data: [120, 150, 110, 180, 130],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>Travel Analytics & Insights</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Projected cost allocations, destination interest metrics, and budget distribution.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '16px' }}>Estimated Expense Distribution</h3>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Doughnut data={budgetBreakdown} />
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '16px' }}>Popular Travel Destinations</h3>
          <Bar data={popularityData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '16px' }}>Daily Expenditure Curve</h3>
        <Line data={costTrendData} options={{ responsive: true }} />
      </div>
    </div>
  );
}