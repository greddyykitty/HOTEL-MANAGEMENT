import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

// A simple dashboard to show on successful login
const Dashboard = () => {
  const { user, logout } = React.useContext(AuthContext);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dark-950 text-white animate-fade-in">
      <div className="bg-dark-900 border border-dark-800 p-8 rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
          Welcome back!
        </h1>
        <p className="text-slate-400 mb-6">You are logged in as {user?.username} ({user?.role})</p>
        
        <button 
          onClick={logout}
          className="w-full bg-dark-800 hover:bg-dark-700 text-white font-medium py-3 rounded-lg transition-colors border border-dark-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
