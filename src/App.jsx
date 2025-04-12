
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import SignUp from '@/pages/SignUp';
import Login from '@/pages/Login';
import ResetPassword from '@/pages/ResetPassword';
import AdminDashboard from '@/pages/AdminDashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import LivingRecord from '@/pages/LivingRecord';
import OnboardingWizard from '@/components/OnboardingWizard';
import ProtectedRoute from '@/components/ProtectedRoute';
import SetupSupabase from '@/components/SetupSupabase';
import Tradesea from '@/pages/Tradesea';
import PulseMarket from '@/pages/PulseMarket';
import EntityDetail from '@/pages/EntityDetail';
import BusinessLaunchWizard from '@/components/business/BusinessLaunchWizard';
import BusinessDashboard from '@/pages/BusinessDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/setup" element={<SetupSupabase />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route
              path="/admin-portal"
              element={
                <ProtectedRoute role="The Living Covenant">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-dashboard"
              element={
                <ProtectedRoute>
                  <BusinessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/living-record"
              element={
                <ProtectedRoute>
                  <LivingRecord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tradesea"
              element={
                <ProtectedRoute>
                  <Tradesea />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pulse-market"
              element={
                <ProtectedRoute>
                  <PulseMarket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pulse-market/:id"
              element={
                <ProtectedRoute>
                  <EntityDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-launch"
              element={
                <ProtectedRoute>
                  <BusinessLaunchWizard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
