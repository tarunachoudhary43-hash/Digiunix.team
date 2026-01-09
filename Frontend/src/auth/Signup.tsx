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
import { Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/digiunixlogo.png";

const API = `${import.meta.env.VITE_API_URL}/api/auth`;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Load theme on mount to match your branding
  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") || "royal-indigo";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/signup`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      alert(res.data.message || "Signup successful");
      navigate("/signin");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff", // Pure white background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Paper
        elevation={0} // Using border for a more modern, flat aesthetic
        sx={{
          width: "100%",
          maxWidth: 400,
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
          Create Account
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "var(--text-muted)" }}
          align="center"
          mb={3}
        >
          Sign up to continue to CRM Pro
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
            label="Full Name"
            name="fullName"
            margin="dense"
            value={formData.fullName}
            onChange={handleChange}
            required
            sx={inputStyles}
          />

          <TextField
            fullWidth
            size="small"
            label="Email Address"
            name="email"
            type="email"
            margin="dense"
            value={formData.email}
            onChange={handleChange}
            required
            sx={inputStyles}
          />

          <TextField
            fullWidth
            size="small"
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            margin="dense"
            value={formData.password}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff sx={{fontSize: 20}} /> : <Visibility sx={{fontSize: 20}} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />

          <TextField
            fullWidth
            size="small"
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            margin="dense"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff sx={{fontSize: 20}} /> : <Visibility sx={{fontSize: 20}} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<PersonAdd />}
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
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </Box>

        <Typography variant="body2" align="center" mt={3} sx={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

// Reusable input styles to handle theme focus
const inputStyles = {
  "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "var(--primary)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" }
};

export default Signup;