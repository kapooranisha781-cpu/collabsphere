import axios from "axios";

export const TOKEN_KEY = "cs_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Har request ke saath token bhejo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expire/invalid ho to login par bhejo (auth wali requests ko chhodkar)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthCall = ["/auth/login", "/auth/register", "/auth/me"].some((p) => url.includes(p));
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Error se user ko dikhane layak message nikalo
export const getErrorMessage = (error) =>
  error.response?.data?.message ||
  (error.request ? "Cannot reach the server. Is the backend running?" : error.message) ||
  "Something went wrong";

export default api;