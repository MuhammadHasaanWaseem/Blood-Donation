import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminLogin from './pages/AdminLogin.jsx';
import './App.css';
import AdminDashboard from './pages/Admin-Dashboard.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
    </Routes>
  </BrowserRouter>
);
