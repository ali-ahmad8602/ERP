import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './screens/Layout/AppShell';
import { Login } from './screens/Auth/Login';
import { Register } from './screens/Auth/Register';
import { AcceptInvite } from './screens/Auth/AcceptInvite';
import { Dashboard } from './screens/Dashboard/Dashboard';
import { DepartmentDetail } from './screens/Department/DepartmentDetail';
import { ProjectBoard } from './screens/Board/ProjectBoard';
import { Settings } from './screens/Settings/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/:token" element={<AcceptInvite />} />

        {/* Protected App Shell */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="departments/:id" element={<DepartmentDetail />} />
          <Route path="boards/:id" element={<ProjectBoard />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
