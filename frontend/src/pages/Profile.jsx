import { Link } from "react-router-dom";
import { UserRound, Mail, CalendarDays, FolderKanban, LogOut } from "lucide-react";

import { useAuth } from "../context/useAuth.js";
import { useToast } from "../context/useToast.js";
import "./Profile.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out");
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View your CollabSphere account information.</p>
        </div>
      </div>

      <section className="card profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <h2>{user?.name || "User"}</h2>
        <p className="profile-role">CollabSphere Member</p>

        <div className="profile-details">
          <div className="profile-detail-row">
            <span><UserRound size={18} /> Full name</span>
            <strong>{user?.name || "Not available"}</strong>
          </div>

          <div className="profile-detail-row">
            <span><Mail size={18} /> Email address</span>
            <strong>{user?.email || "Not available"}</strong>
          </div>

          <div className="profile-detail-row">
            <span><CalendarDays size={18} /> Account created</span>
            <strong>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN")
                : "Not available"}
            </strong>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/projects" className="btn btn-secondary">
            <FolderKanban size={16} /> My Projects
          </Link>

          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;