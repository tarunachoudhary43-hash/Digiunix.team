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
import { Visibility, VisibilityOff, Login } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/digiunixlogo.png";


const API = `${import.meta.env.VITE_API_URL}/api/auth`;

const Signin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") || "royal-indigo";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await axios.post(`${API}/signin`, { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff", // Keep background white
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Paper
        elevation={0} // Using border instead of heavy shadow for a cleaner look
        sx={{
          width: "100%",
          maxWidth: 380,
          p: 4,
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Themed Logo Area */}
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
          Sign in to CRM Pro
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "var(--text-muted)" }}
          align="center"
          mb={3}
        >
          Enter your credentials to continue
        </Typography>

        {error && (
          <Typography color="error" variant="body2" align="center" mb={2} sx={{ fontWeight: 500 }}>
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
              "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" }
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "var(--primary)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
              mb: 1
            }}
          />

          <Box textAlign="right">
            <Link
              to="/forgot-password"
              style={{
                fontSize: "13px",
                color: "var(--primary)", // THEMED
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<Login />}
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: "var(--radius)",
              fontWeight: 700,
              textTransform: "none",
              backgroundColor: "var(--primary)", // THEMED
              "&:hover": {
                backgroundColor: "var(--primary-dark)", // THEMED
              },
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </Box>

        <Typography variant="body2" align="center" mt={3} sx={{ color: "var(--text-muted)" }}>
          Don’t have an account?{" "}
          <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signin;