import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Preference from './preference';
import Shortcuts from './Shortcuts';
import QRScanner from './QRScanner';
import Home from './home'; // import Home page
import LandingPage from './LandingPage';
import CardLogin from './CardLogin';
import WatsonChat from './WatsonChat';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/CardLogin" element={<CardLogin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/preferences" element={<Preference />} />
        <Route path="/shortcuts" element={<Shortcuts />} /> 
        <Route path="/QRScanner" element={<QRScanner />} />
        <Route path="/watsonchat" element={<WatsonChat />} /> 
        <Route path="/QRScanner" element={<QRScanner />} />
      </Routes>
    </Router>
);
