import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/TenantDashboard';
import TenantProfile from './pages/TenantProfile';
import TenantInterests from './pages/TenantInterests';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerInterests from './pages/OwnerInterests';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/tenant"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <TenantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/profile"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <TenantProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/interests"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <TenantInterests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/interests"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerInterests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['tenant', 'owner']}>
                  <Chat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
