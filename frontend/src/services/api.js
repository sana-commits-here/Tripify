import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export const generateItinerary = async (tripData) => {
  const response = await axios.post(`${API_BASE}/generate`, tripData);
  return response.data;
};

export const modifyItinerary = async (tripId, userFeedback) => {
  const response = await axios.post(`${API_BASE}/modify`, {
    trip_id: tripId,
    user_feedback: userFeedback
  });
  return response.data;
};

export const getTripHistory = async () => {
  const response = await axios.get(`${API_BASE}/history`);
  return response.data;
};