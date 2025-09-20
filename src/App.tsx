import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public pages
import { HomePage } from './pages/public/HomePage';
import { NewsPage } from './pages/public/NewsPage';
import { NewsDetailPage } from './pages/public/NewsDetailPage';
import { TournamentsPage } from './pages/public/TournamentsPage';
import { AuthPage } from './pages/public/AuthPage';

// Dashboard pages
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { UserTournaments } from './pages/dashboard/UsersTournaments';
import { UserResults } from './pages/dashboard/UserResults';
import { UserProfile } from './pages/dashboard/UserProfile';

// Admin pages
import { AdminHome } from './pages/admin/AdminHome';
import { AdminNews } from './pages/admin/AdminNews';
import { CreateNews } from './pages/admin/CreateNews';
import { AdminTournaments } from './pages/admin/AdminTournaments';
import { AdminPlayers } from './pages/admin/AdminPlayers';
import { AdminLeaderboard } from './pages/admin/AdminResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route path="/" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />a
              <main className="flex-1">
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/news" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <NewsPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/news/:id" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <NewsDetailPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/tournaments" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <TournamentsPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/auth" element={<AuthPage />} />

          {/* Player Dashboard Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout type="player" />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="tournaments" element={<UserTournaments />} />
            <Route path="results" element={<UserResults />} />
            <Route path="news" element={<NewsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout type="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminHome />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="create" element={<CreateNews />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="results" element={<AdminLeaderboard />} />
          </Route>


          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;