import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach JWT access token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('constructai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Extract data envelope
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Server connection error';
    return Promise.reject(new Error(errorMsg));
  }
);

export const apiService = {
  // Health
  getHealth: () => api.get('/health'),

  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  demoLogin: () => api.post('/auth/demo-login'),
  register: (payload) => api.post('/auth/register', payload),
  getMe: () => api.get('/auth/me'),

  // Projects
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (payload) => api.post('/projects', payload),
  addTask: (projectId, taskData) => api.post(`/projects/${projectId}/tasks`, taskData),
  updateTask: (projectId, taskId, updates) => api.put(`/projects/${projectId}/tasks/${taskId}`, updates),
  deleteTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  generateScheduleProposal: (params) => api.post('/projects/ai-proposal', params),

  // Safety Analysis
  analyzeSafety: (formData) => api.post('/safety/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSafetyHistory: (projectId) => api.get('/safety/history', { params: { project_id: projectId } }),

  // Crack Detection
  analyzeCrack: (formData) => api.post('/cracks/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCrackHistory: (projectId) => api.get('/cracks/history', { params: { project_id: projectId } }),

  // Estimation
  calculateEstimation: (data) => api.post('/estimation/calculate', data),
  getEstimationHistory: () => api.get('/estimation/history'),

  // Valuation
  calculateValuation: (data) => api.post('/valuation/calculate', data),
  getValuationHistory: () => api.get('/valuation/history'),

  // Assistant & Chat
  sendChatMessage: (message, taskCategory = 'Daily Operations', history = []) => 
    api.post('/assistant/chat', { message, task_category: taskCategory, history }),
  createDailyReport: (payload) => api.post('/assistant/daily-report', payload),
  getDailyReports: (projectId) => api.get('/assistant/daily-reports', { params: { project_id: projectId } }),

  // Weather Advisory
  getWeatherAdvisory: (location) => api.get('/weather/advisory', { params: { location } }),

  // Executive Reports
  getExecutiveSummary: () => api.get('/reports/summary')
};

export default apiService;
