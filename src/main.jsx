// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from "./pages/Admin"
import App from './App'; 
import './index.css'
import Client from './pages/Client';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> 
        <Route path="/:id" element={<App />} /> 
        <Route path="/:id/warehouse" element={<Client />} />  
        <Route path="/:firstId/change/:secondId" element={<Admin />} />
      </Routes>
    </Router>
  </React.StrictMode>
);