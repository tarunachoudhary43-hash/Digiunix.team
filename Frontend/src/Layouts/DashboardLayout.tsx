import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../Components/Sidebar";
//  import DashboardPage from "../Pages/Dashboard";
import LeadsPage from "../Pages/Leads";
// import AnalyticsPage from "../Pages/Analytics";
import SalesTeamPage from "../Pages/SalesTeamPage";
import SettingsPage from "../Pages/Settings";

const DashboardLayout: React.FC = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw" }}>
      {/* Sidebar Container: Desktop par 270px jagah fix rakhta hai */}
      <Box 
        component="nav" 
        sx={{ 
          width: { md: "270px" }, 
          flexShrink: 0,
          display: { xs: "none", md: "block" } 
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content: Sidebar ke baad bachi hui jagah leta hai */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "var(--primary-bg, #f8fafc)",
          minHeight: "100vh",
          // Mobile par full width, desktop par bachi hui width
          width: { xs: "100%", md: "calc(100% - 270px)" },
          paddingTop: { xs: "70px", md: 0 },
          transition: "background-color 0.3s ease",
        }}
      >
        <Routes>
           {/* <Route index element={<DashboardPage />} /> */}
          <Route path="leads" element={<LeadsPage />} />
          {/* <Route path="analytics" element={<AnalyticsPage />} /> */}
          <Route path="sales-team" element={<SalesTeamPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardLayout;