import React, { useEffect, useState } from "react";
import {
  Box, Container, Typography, Paper, TextField, Button,
  Avatar, IconButton, Card, Stack, Divider
} from "@mui/material";
import {
  PhotoCamera, CheckCircle, Palette,
  RocketLaunch, Person, Save
} from "@mui/icons-material";
import axios from "../api/axios";
import { useProfile } from "../Components/ProfileContext";
import { themes, applyTheme } from "../utils/themeUtils";
import type { Theme } from "../utils/themeUtils";



const CRMSettings: React.FC = () => {
  const { user, setUser } = useProfile();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [activeTheme, setActiveTheme] = useState("royal-indigo");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPreview(user.avatar || "");
      // Database se aayi hui theme set karein
      if (user.theme) {
        setActiveTheme(user.theme);
        const t = themes.find(t => t.id === user.theme);
        if (t) applyTheme(t.id);
      }
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Naya Theme Change Function (Instant Backend Sync)
  const handleThemeChange = async (theme: Theme) => {
    setActiveTheme(theme.id);
    applyTheme(theme.id);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.put("/api/theme",
        { theme: theme.id },
        { headers: { "Authorization": `Bearer ${token}` } }
      );

      // Agar backend se response (200 OK) aa raha hai toh context update karein
      if (res.data.success) {
        setUser(res.data.user);
        console.log("Theme synced with database");
      }
    } catch (err) {
      console.error("Theme update failed", err);
    }
  };
  const handleSaveProfile = async () => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await axios.put("/api/profile/update", formData, {
        headers: {
          "Authorization": `Bearer ${savedToken}`,
          "Content-Type": "multipart/form-data"
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        alert("Profile updated successfully!");
      }
    } catch (err: any) {
      alert("Failed to update profile");
    }
  };

  const currentTheme = themes.find(t => t.id === activeTheme) || themes[0];

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Box sx={{ p: 1, borderRadius: 2, background: currentTheme.gradient, color: 'white' }}>
            <RocketLaunch fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>Settings</Typography>
            <Typography variant="caption" color="text.secondary">Manage your identity and workspace vibe</Typography>
          </Box>
        </Stack>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Palette fontSize="small" sx={{ color: currentTheme.primary }} /> Appearance
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {themes.map(theme => (
              <Box key={theme.id} sx={{ flex: '1 1 200px', maxWidth: '200px' }}>
                <Card
                  onClick={() => handleThemeChange(theme)}
                  elevation={activeTheme === theme.id ? 4 : 0}
                  sx={{
                    borderRadius: 3, cursor: "pointer",
                    border: activeTheme === theme.id ? `2px solid ${theme.primary}` : "2px solid #e2e8f0",
                    transition: "all 0.2s", textAlign: 'center', p: 1,
                    bgcolor: activeTheme === theme.id ? theme.primaryBg : 'white'
                  }}
                >
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "50%", background: theme.gradient,
                    mx: 'auto', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {activeTheme === theme.id && <CheckCircle sx={{ color: "white", fontSize: 18 }} />}
                  </Box>
                  <Typography variant="caption" fontWeight={700} display="block">{theme.name}</Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" sx={{ color: currentTheme.primary }} /> Profile Information
        </Typography>
        
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ position: "relative" }}>
              <Avatar 
                src={preview || "/default-avatar.png"} 
                sx={{ width: 100, height: 100, border: `3px solid ${currentTheme.primaryBg}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <IconButton 
                component="label"
                size="small"
                sx={{ 
                  position: "absolute", bottom: 0, right: 0, 
                  bgcolor: "white", color: currentTheme.primary,
                  boxShadow: 2, "&:hover": { bgcolor: "#f0f0f0" }
                }}
              >
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                <PhotoCamera fontSize="inherit" />
              </IconButton>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth size="small" label="Full Name" variant="filled"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth size="small" label="Email Address" variant="filled" disabled
                  value={user?.email || ""}
                  InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                />
                <Button
                  fullWidth variant="contained" disableElevation
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{
                    borderRadius: 2, py: 1, fontWeight: 700, textTransform: 'none',
                    bgcolor: currentTheme.primary,
                    "&:hover": { bgcolor: currentTheme.primary, filter: 'brightness(0.9)' }
                  }}
                >
                  Update Profile
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default CRMSettings;