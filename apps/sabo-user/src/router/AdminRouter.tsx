/**
 * Admin Router Component
 * Routing for admin-specific pages
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const AdminRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin" element={<div>Admin Dashboard</div>} />
      <Route path="/admin/*" element={<div>Admin Section</div>} />
    </Routes>
  );
};

export default AdminRouter;
