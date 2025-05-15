import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

import AuthVerify from './components/AuthVerify';
import NavigationBar from './components/NavigationBar';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import MedicalRecord from './pages/MedicalRecord';
import PatientDashboard from './pages/PatientDashboard';
import Profile from './pages/Profile';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <NavigationBar />
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/patient-dashboard" element={
              <PrivateRoute requireRole="PATIENT">
                <PatientDashboard />
              </PrivateRoute>
            } />
            <Route path="/doctor-dashboard" element={
              <PrivateRoute requireRole="DOCTOR">
                <DoctorDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin-dashboard" element={
              <PrivateRoute requireRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/medical-record/:id" element={
              <PrivateRoute>
                <MedicalRecord />
              </PrivateRoute>
            } />
          </Routes>
        </div>
        <AuthVerify />
      </div>
    </Router>
  );
}

export default App; 