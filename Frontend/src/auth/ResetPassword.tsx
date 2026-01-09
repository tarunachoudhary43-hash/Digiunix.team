import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, LockReset } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../assets/digiunixlogo.png";

const API = `${import.meta.env.VITE_API_URL}/api/auth`;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // 1. Add this state to force a re-render when the theme is loaded
  const [currentTheme, setCurrentTheme] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") || "royal-indigo";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setCurrentTheme(savedTheme); // Trigger re-render
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message || "Password reset successful");

      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Reusable input styles inside the component to ensure it picks up the latest state
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" }
  };

  return (
    <Box
      key={currentTheme} // 2. Using key forces React to re-mount/re-paint when theme changes
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 380,
          p: 4,
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.3s ease", // Smooth color transition
        }}
      >
        <Box textAlign="center" mb={3}>
           <Box
  sx={{
    width: 140,        // increased width
    height: 90,        // increased height (better for logo)
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    margin: "0 auto", // ensures perfect centering
  }}
>

            <img
  src={logo}
  alt="DigiUnix.AI"
  style={{
    width: "100%",
    height: "800%",
    objectFit: "contain", // prevents logo cropping
    display: "block",
  }}
/>

          </Box>

        </Box>

        <Typography variant="h5" fontWeight={800} align="center" sx={{ color: "var(--text-base)" }}>
          Reset Password
        </Typography>
        
        <Typography variant="body2" sx={{ color: "var(--text-muted)", mt: 1 }} align="center" mb={3}>
          Enter your new secure password
        </Typography>

        {message && (
          <Box sx={{ bgcolor: "var(--primary-lighter)", p: 1.5, borderRadius: 1.5, mb: 2, opacity: 0.2 }}>
             <Typography variant="body2" sx={{ color: "var(--primary)", fontWeight: 600 }} align="center">
              {message}
            </Typography>
          </Box>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ fontWeight: 600, bgcolor: "#fef2f2", p: 1, borderRadius: 1 }} align="center" mb={2}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            size="small"
            label="New Password"
            type={showPassword ? "text" : "password"}
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={inputStyles}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            margin="dense"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={inputStyles}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<LockReset />}
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: "var(--radius)",
              fontWeight: 700,
              textTransform: "none",
              backgroundColor: "var(--primary)",
              "&:hover": {
                backgroundColor: "var(--primary-dark)",
              },
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;