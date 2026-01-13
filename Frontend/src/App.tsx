import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Signin from "./auth/Signin";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

import DashboardLayout from "./Layouts/DashboardLayout";
import { ProfileProvider } from "./Components/ProfileContext";
import { ThemeProvider } from "./Components/ThemeContext";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Auth routes */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Dashboard (protected layout inside) */}
          <Route path="/dashboard/*" element={<DashboardLayout />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </ProfileProvider>
    </ThemeProvider>
  );
};

export default App;
