
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import { useAuth } from "../context/useAuth.js";
import { useToast } from "../context/useToast.js";
import { getErrorMessage } from "../api/axios";
import "./Login.css";

const Login = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password)
      return toast.error("Please enter email and password");

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <Boxes size={24} /> CollabSphere
        </Link>

        <h1>Welcome back</h1>
        <p className="auth-sub">
          Log in to continue to your projects.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-button-row">
            <button
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>

            <button
              type="button"
              className="auth-back-btn"
              onClick={() => {
                if (window.history.state?.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
            >
              ← Back
            </button>
          </div>
        </form>

        <p className="auth-switch">
          New to CollabSphere? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
