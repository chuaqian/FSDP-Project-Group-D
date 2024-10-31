import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Preference from './preference';
import Shortcuts from './Shortcuts';
import Home from './home'; // import Home page

import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preferences" element={<Preference />} />
        <Route path="/shortcuts" element={<Shortcuts />} /> 
      </Routes>
    </Router>
  </React.StrictMode>
);
