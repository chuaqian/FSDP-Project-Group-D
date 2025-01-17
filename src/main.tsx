import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Preference from './preference';
import Shortcuts from './Shortcuts';
import QRScanner from './QRScanner';
import Home from './home';
import LandingPage from './LandingPage';
import CardLogin from './CardLogin';
import WatsonChat from './WatsonChat';
import './index.css';
import TransactionConfirmation from './TransactionConfirmation';
import OtherAmounts from './OtherAmounts';
import Withdraw from './Withdraw';  
import MoreServices from './MoreServices';

createRoot(document.getElementById('root')!).render(
    <Router>
      <WatsonChat />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/CardLogin" element={<CardLogin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/preferences" element={<Preference />} />
        <Route path="/shortcuts" element={<Shortcuts />} /> 
        <Route path="/QRScanner" element={<QRScanner />} />
        <Route path="/transaction-confirmation" element={<TransactionConfirmation />} />
        <Route path="/OtherAmounts" element={<OtherAmounts />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/MoreServices" element={<MoreServices />} /> 
      </Routes>
    </Router>
);
