import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/digiunixlogo.png";

const API = `${import.meta.env.VITE_API_URL}/api/auth`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") || "royal-indigo";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);
      const res = await axios.post(`${API}/forgot-password`, { email });
      setMessage(res.data.message || "Reset link sent to your email");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
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
        }}
      >
        {/* Themed Logo */}
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
          Forgot Password
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "var(--text-muted)", mt: 1 }}
          align="center"
          mb={3}
        >
          Enter your email to receive a reset link
        </Typography>

        {message && (
          <Typography 
            variant="body2" 
            sx={{ color: "var(--success)", fontWeight: 600, bgcolor: "#f0fdf4", p: 1.5, borderRadius: 1.5, border: '1px solid #dcfce7' }} 
            align="center" 
            mb={2}
          >
            {message}
          </Typography>
        )}

        {error && (
          <Typography 
            variant="body2" 
            color="error" 
            sx={{ fontWeight: 600, bgcolor: "#fef2f2", p: 1.5, borderRadius: 1.5, border: '1px solid #fee2e2' }} 
            align="center" 
            mb={2}
          >
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            size="small"
            label="Email Address"
            type="email"
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ 
              "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "var(--primary)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
              mb: 1
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<MailOutline />}
            disabled={loading}
            sx={{
              mt: 2,
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
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </Box>

        <Typography variant="body2" align="center" mt={3} sx={{ color: "var(--text-muted)" }}>
          Remembered your password?{" "}
          <Link to="/signin" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;