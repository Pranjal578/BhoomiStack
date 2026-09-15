import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Navbar from './components/shared/Navbar';
import Toast from './components/shared/Toast';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import VerificationPage from './pages/VerificationPage';
import DocumentIntelligencePage from './pages/DocumentIntelligencePage';
import LoginPage from './pages/LoginPage';
import RevenueDashboard from './pages/dashboard/RevenueDashboard';
import PlanningDashboard from './pages/dashboard/PlanningDashboard';
import MunicipalDashboard from './pages/dashboard/MunicipalDashboard';
import AdminPanel from './pages/AdminPanel';
import VerifyCertificate from './pages/VerifyCertificate';
import { useAuthStore } from './store';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/verify/:verificationId" element={<VerifyCertificate />} />
            <Route path="/documents" element={<DocumentIntelligencePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/revenue" element={
              <ProtectedRoute roles={['revenue_officer', 'admin']}>
                <RevenueDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/planning" element={
              <ProtectedRoute roles={['planning_officer', 'admin']}>
                <PlanningDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/municipal" element={
              <ProtectedRoute roles={['municipal_officer', 'admin']}>
                <MunicipalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </BrowserRouter>
  );
}
