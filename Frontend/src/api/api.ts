import axios from "axios";

const API = axios.create({
  baseURL: "https://digiunix-ai-crm-model.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export default API;
