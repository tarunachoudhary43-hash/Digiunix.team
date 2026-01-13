import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../Components/Sidebar";
import Header from "../Pages/Header"; // Agar header use karna hai toh
import DashboardPage from "../Pages/Dashboard";
import LeadsPage from "../Pages/Leads";
import SalesTeamPage from "../Pages/SalesTeamPage";
import SettingsPage from "../Pages/Settings";

const DashboardLayout: React.FC = () => {
  const SIDEBAR_WIDTH = "270px";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", overflowX: "hidden" }}>
      {/* 1. SIDEBAR (Fixed for Desktop) */}
      <Box 
        component="nav" 
        sx={{ 
          width: { md: SIDEBAR_WIDTH }, 
          flexShrink: 0,
          // Sidebar component ke andar drawer logic honi chahiye mobile ke liye
        }}
      >
        <Sidebar />
      </Box>

      {/* 2. MAIN CONTENT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          // Desktop par sidebar ki width jitni margin left
          ml: { md: 0 }, 
          width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH})` },
          // Mobile header ke liye padding top (agar mobile top bar hai)
          pt: { xs: "70px", md: "20px" }, 
          px: { xs: 2, md: 4 },
          pb: 4,
          transition: "all 0.3s ease",
        }}
      >
        <Routes>
          {/* Dashboard default page */}
          <Route index element={<DashboardPage />} />
          
          {/* Nested Sub-pages */}
          <Route path="leads" element={<LeadsPage />} />
          <Route path="sales-team" element={<SalesTeamPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Fallback for wrong sub-routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardLayout;