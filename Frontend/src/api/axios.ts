import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", 
  // baseURL: "https://digiunix-ai-crm-model.onrender.com",
});

export default instance;
