import axios from "axios";
const API = axios.create({ baseURL: "/api" });

// Add token to requests
API.interceptors.request.use((req) => {
  if (localStorage.getItem("token")) {
    req.headers.Authorization = localStorage.getItem("token");
  }
  return req;
});

export default API;
