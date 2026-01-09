import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // local backend url
  // baseURL: "https://digiunix-ai-crm-model.onrender.com", // deploy backend url
});

export default instance;
