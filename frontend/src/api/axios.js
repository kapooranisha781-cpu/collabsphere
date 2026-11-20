
import axios from "axios";

export const TOKEN_KEY = "cs_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Send token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired or invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";

    const isAuthCall = [
      "/auth/login",
      "/auth/register",
      "/auth/me",
    ].some((p) => url.includes(p));

    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Get user-friendly error message
export const getErrorMessage = (error) =>
  error.response?.data?.message ||
  (error.request
    ? "Cannot reach the server. Please check your connection."
    : error.message) ||
  "Something went wrong";

export default api;
