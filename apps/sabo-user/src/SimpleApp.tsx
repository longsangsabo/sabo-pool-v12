import React from 'react';
import {
 BrowserRouter as Router,
 Routes,
 Route,
} from 'react-router-dom';

import SimpleHomePage from '@/pages/SimpleHomePage';

const SimpleApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHomePage />} />
        <Route path="*" element={<SimpleHomePage />} />
      </Routes>
    </Router>
  );
};

export default SimpleApp;