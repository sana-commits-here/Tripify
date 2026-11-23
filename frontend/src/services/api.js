import axios from 'axios';

// Same-origin /api (Vercel function in production, Vite proxy to FastAPI in dev).
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const generateItinerary = async (tripData) => {
  const response = await axios.post(`${API_BASE}/generate`, tripData);
  return response.data;
};

export const modifyItinerary = async (tripId, userFeedback, trip = {}) => {
  const response = await axios.post(`${API_BASE}/modify`, {
    trip_id: tripId,
    user_feedback: userFeedback,
    destination: trip.destination,
    existing_itinerary: trip.itinerary,
    days: trip.days
  });
  return response.data;
};

export const getTripHistory = async () => {
  const response = await axios.get(`${API_BASE}/history`);
  return response.data;
};