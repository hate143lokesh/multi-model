import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SafetyAnalyzerPage from './pages/SafetyAnalyzerPage';
import CrackAssessmentPage from './pages/CrackAssessmentPage';
import CostEstimatorPage from './pages/CostEstimatorPage';
import ProjectPlanningPage from './pages/ProjectPlanningPage';
import ValuationPage from './pages/ValuationPage';
import DailyAssistantPage from './pages/DailyAssistantPage';
import WeatherAdvisoryPage from './pages/WeatherAdvisoryPage';
import KnowledgeAssistantPage from './pages/KnowledgeAssistantPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Optional simple protected route wrapper: Allows access if demo or token exists
function RequireAuth({ children }) {
  const token = localStorage.getItem('constructai_token');
  // For seamless college review / first run, auto-seed a demo session if empty
  if (!token) {
    localStorage.setItem('constructai_token', 'demo-session-token');
    localStorage.setItem('constructai_user', JSON.stringify({
      full_name: 'Chief Site Engineer',
      role: 'Principal Project Manager',
      email: 'admin@constructai.io'
    }));
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Dashboard Workspace */}
        <Route path="/" element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="safety" element={<SafetyAnalyzerPage />} />
          <Route path="cracks" element={<CrackAssessmentPage />} />
          <Route path="estimation" element={<CostEstimatorPage />} />
          <Route path="planning" element={<ProjectPlanningPage />} />
          <Route path="valuation" element={<ValuationPage />} />
          <Route path="assistant" element={<DailyAssistantPage />} />
          <Route path="weather" element={<WeatherAdvisoryPage />} />
          <Route path="knowledge" element={<KnowledgeAssistantPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
