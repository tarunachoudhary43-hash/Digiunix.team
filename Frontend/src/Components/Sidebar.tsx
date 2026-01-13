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
  UsersRound,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/digiunixlogo.png";
import { useProfile } from "../Components/ProfileContext";
import axios from "axios"; // Standard axios for logout

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openLogout, setOpenLogout] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, setUser } = useProfile();

  /* --- LOGOUT LOGIC (Fixed) --- */
  const handleConfirmLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "https://digiunix-ai-crm-model.onrender.com";
      
      if (token) {
        // Attempt API logout but don't block the UI if it fails
        await axios.post(`${API_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => console.log("Logout backend already expired or unreachable"));
      }
    } catch (error) {
      console.error("Logout process error:", error);
    } finally {
      // ALWAYS clear local state regardless of API success
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setOpenLogout(false);
      navigate("/signin");
    }
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNavClick = () => isMobile && setMobileOpen(false);

  const sidebarWidth = "270px";

  /* --- STYLES --- */
  const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "var(--text-muted, #64748b)",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "15px",
    transition: "all 0.2s ease",
    marginBottom: "8px",
  };

  const activeLinkStyle: React.CSSProperties = {
    background: "var(--primary, #6366f1)",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
  };

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4, px: 1 }}>
        <Box sx={{ width: 45, height: 45, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#fff", border: "1px solid #eee", p: 0.5 }}>
          <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ color: "var(--text, #1e293b)", letterSpacing: -0.5 }}>
          CRM Pro
        </Typography>
      </Stack>

      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, flex: 1 }}>
        {[
          { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, exact: true },
          { to: "/dashboard/leads", label: "Leads", icon: <Users size={20} /> },
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

      <Box sx={{ pt: 2, borderTop: "1px solid var(--border, #e2e8f0)" }}>
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", p: "12px", bgcolor: "var(--primary-bg, #f5f3ff)", borderRadius: "12px", mb: 2, border: "1px solid var(--border, #e2e8f0)" }}>
            <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>{user.fullName?.charAt(0)}</Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{user.fullName}</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap display="block">{user.email}</Typography>
            </Box>
          </Box>
        )}
        <Button fullWidth variant="text" onClick={() => setOpenLogout(true)} startIcon={<LogOut size={20} />} sx={{ justifyContent: "flex-start", color: "#ef4444", textTransform: "none", fontWeight: 700 }}>
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton onClick={handleDrawerToggle} sx={{ position: "fixed", top: 10, left: 10, zIndex: 2000, bgcolor: "#fff", boxShadow: 2 }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </IconButton>
      )}

      {!isMobile ? (
        <Box component="aside" sx={{ width: sidebarWidth, height: "100vh", position: "fixed", left: 0, top: 0, bgcolor: "background.paper", borderRight: "1px solid", borderColor: "divider", p: 3, zIndex: 1100 }}>
          {sidebarContent}
        </Box>
      ) : (
        <Drawer open={mobileOpen} onClose={handleDrawerToggle} sx={{ "& .MuiDrawer-paper": { width: sidebarWidth, p: 3 } }}>
          {sidebarContent}
        </Drawer>
      )}

      <Dialog open={openLogout} onClose={() => setOpenLogout(false)}>
        <DialogTitle>Logout?</DialogTitle>
        <DialogContent><Typography>Are you sure you want to end your session?</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenLogout(false)}>Cancel</Button>
          <Button onClick={handleConfirmLogout} variant="contained" color="error">Logout</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;