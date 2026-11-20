
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import { useAuth } from "../context/useAuth.js";
import { useToast } from "../context/useToast.js";
import { getErrorMessage } from "../api/axios";
import "./Login.css";
import "./Register.css";

const Register = () => {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.name.trim().length < 2)
      return toast.error("Name must be at least 2 characters");

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return toast.error("Please enter a valid email");

    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");

    setSubmitting(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.success("Account created. Welcome to CollabSphere!");
      navigate("/dashboard", { replace: true });
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

        <h1>Create your account</h1>
        <p className="auth-sub">
          Start collaborating with your team in minutes.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              className="input"
              placeholder="Asha Verma"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
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
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className="input"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-button-row">
            <button
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create account"}
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
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
