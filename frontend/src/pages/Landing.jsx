import { Link } from "react-router-dom";
import { Boxes, Users, FileText, Sparkles, Files, BarChart3, Share2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/useAuth.js";
import "./Landing.css";

const features = [
  { icon: Users, title: "Team collaboration", text: "Invite registered users to your project and work together with clear owner and member roles." },
  { icon: FileText, title: "Markdown notes", text: "Write docs with headings, lists, code blocks and tables, with a live preview as you type." },
  { icon: Sparkles, title: "Gemini AI built in", text: "Explain code, improve writing and generate documentation or a full README in one click." },
  { icon: Files, title: "Files and code preview", text: "Upload code, images and PDFs, then preview them in a clean, readable viewer." },
  { icon: BarChart3, title: "Contribution analytics", text: "See who created notes, who uploaded files and how active the project has been." },
  { icon: Share2, title: "Public sharing", text: "Share a read-only project page with a private link. Turn it off whenever you want." },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <Boxes size={24} /> CollabSphere
        </Link>
        <nav className="landing-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Go to dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <span className="hero-badge"><Sparkles size={14} /> Powered by Google Gemini</span>
        <h1>
          Build, document and ship <span>together</span>.
        </h1>
        <p>
          CollabSphere is a developer workspace for projects, Markdown docs, shared files and
          AI-assisted documentation, all in one place.
        </p>
        <div className="hero-actions">
          <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary">
            {user ? "Open dashboard" : "Create free account"} <ArrowRight size={16} />
          </Link>
          {!user && <Link to="/login" className="btn btn-secondary">I already have an account</Link>}
        </div>
      </section>

      <section className="features">
        <h2>Everything your team needs</h2>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon"><Icon size={20} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p>CollabSphere. Built with React, Node.js, MongoDB and Gemini AI.</p>
      </footer>
    </div>
  );
};

export default Landing;