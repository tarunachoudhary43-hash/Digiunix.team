import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Stack
} from "@mui/material";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  UsersRound,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/digiunixlogo.png";
import { useProfile } from "../Components/ProfileContext";
import axios from "../api/axios";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openLogout, setOpenLogout] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* --- PROFILE FROM CONTEXT --- */
  const { user, setUser } = useProfile();

  /* --- LOGOUT LOGIC --- */
  const handleConfirmLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post("/api/auth/logout", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Proceed with logout even if API fails
    }
    localStorage.clear();
    setUser(null);
    setOpenLogout(false);
    navigate("/signin");
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNavClick = () => isMobile && setMobileOpen(false);

  /* --- DYNAMIC STYLES --- */
  const sidebarWidth = "270px";

  const sidebarStyle: React.CSSProperties = {
    width: sidebarWidth,
    height: "100vh",
    background: "var(--card-bg, #ffffff)",
    borderRight: "1px solid var(--border, #e2e8f0)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 1200,
    overflowY: "auto",
  };

  const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "var(--text-muted, #64748b)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "15px",
    transition: "all 0.2s ease",
    marginBottom: "8px",
  };

  const activeLinkStyle: React.CSSProperties = {
    background: "var(--primary, #6366f1)",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  };

  /* --- SIDEBAR CONTENT COMPONENTS --- */
  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 1. LOGO SECTION */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4, px: 1 }}>
        <Box sx={{ 
          width: 45, height: 45, borderRadius: 2, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          overflow: "hidden", backgroundColor: "#fff", 
          border: "1px solid #eee", p: 0.5 
        }}>
          <img src={logo} alt="DigiUnix.AI" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ color: "var(--text, #1e293b)", letterSpacing: -0.5 }}>
          CRM Pro
        </Typography>
      </Stack>

      {/* 2. NAVIGATION LINKS */}
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, flex: 1 }}>
        {[
          { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, exact: true },
          { to: "/dashboard/leads", label: "Leads", icon: <Users size={20} /> },
          // { to: "/dashboard/analytics", label: "Analytics", icon: <TrendingUp size={20} /> },
          { to: "/dashboard/sales-team", label: "Sales Team", icon: <UsersRound size={20} /> },
          { to: "/dashboard/settings", label: "Settings", icon: <Settings size={20} /> },
        ].map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.to}
              end={item.exact}
              onClick={handleNavClick}
              style={({ isActive }) => (isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </Box>

      {/* 3. PROFILE & LOGOUT SECTION */}
      <Box sx={{ pt: 2, borderTop: "1px solid var(--border, #e2e8f0)" }}>
        {user && (
          <Box sx={{ 
            display: "flex", alignItems: "center", gap: "12px", 
            p: "12px", bgcolor: "var(--primary-bg, #f5f3ff)", 
            borderRadius: "12px", mb: 2, border: "1px solid var(--border, #e2e8f0)" 
          }}>
            <Avatar 
              src={user.avatar} 
              sx={{ width: 40, height: 40, border: "2px solid #fff" }}
            >
              {user.fullName?.charAt(0)}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--text, #1e293b)" }} noWrap>
                {user.fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--text-muted, #64748b)" }} noWrap display="block">
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}

        <Button
          fullWidth
          variant="text"
          onClick={() => setOpenLogout(true)}
          startIcon={<LogOut size={20} />}
          sx={{
            justifyContent: "flex-start",
            color: "#ef4444",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            py: 1.2,
            px: 2,
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON --- */}
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed", top: 16, left: 16, zIndex: 1300,
            bgcolor: "var(--card-bg, #fff)", border: "1px solid var(--border, #ddd)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </IconButton>
      )}

      {/* --- DESKTOP VIEW --- */}
      {!isMobile && (
        <aside style={sidebarStyle}>
          {sidebarContent}
        </aside>
      )}

      {/* --- MOBILE DRAWER --- */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { 
            width: sidebarWidth, 
            p: "24px 16px", 
            background: "var(--card-bg, #ffffff)" 
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* --- LOGOUT DIALOG --- */}
      <Dialog 
        open={openLogout} 
        onClose={() => setOpenLogout(false)}
        PaperProps={{ sx: { borderRadius: "16px", width: "100%", maxWidth: "350px" } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3, fontWeight: 800 }}>Logout?</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to end your session?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button fullWidth onClick={() => setOpenLogout(false)} sx={{ textTransform: "none", fontWeight: 700 }}>Cancel</Button>
          <Button fullWidth onClick={handleConfirmLogout} variant="contained" color="error" sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}>Logout</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;