import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import LeadsGrid from './components/Leads/LeadsGrid';
import LeadForm from './components/Leads/LeadForm';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Header from './components/Layout/Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/leads" 
                element={
                  <ProtectedRoute>
                    <LeadsGrid />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leads/new" 
                element={
                  <ProtectedRoute>
                    <LeadForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leads/:id/edit" 
                element={
                  <ProtectedRoute>
                    <LeadForm />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/leads" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;