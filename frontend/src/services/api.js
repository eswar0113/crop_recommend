import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
if (rawBaseUrl && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}
const API_BASE_URL = rawBaseUrl;

// --- Axios instance with auth interceptor ---
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crop_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth API ---
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// --- Lands API ---
export const getLands = async () => {
  const response = await api.get('/lands');
  return response.data;
};

export const getLandById = async (id) => {
  const response = await api.get(`/lands/${id}`);
  return response.data;
};

export const createLand = async (data) => {
  const response = await api.post('/lands', data);
  return response.data;
};

export const updateLand = async (id, data) => {
  const response = await api.put(`/lands/${id}`, data);
  return response.data;
};

export const deleteLand = async (id) => {
  const response = await api.delete(`/lands/${id}`);
  return response.data;
};

// --- Prediction API ---
export const predictCrop = async (formData) => {
  const response = await api.post('/predict', formData);
  return response.data;
};

// --- History API ---
export const getHistory = async (landId) => {
  const response = await api.get('/history', { params: landId ? { land_id: landId } : {} });
  return response.data;
};

export const deleteHistory = async (landId) => {
  const response = await api.delete('/history', { params: landId ? { land_id: landId } : {} });
  return response.data;
};

// --- Health API ---
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};
