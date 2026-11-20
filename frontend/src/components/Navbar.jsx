import { useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/useAuth.js";
import { useToast } from "../context/useToast.js";
import "./Navbar.css";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <button className="navbar-menu" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={22} />
      </button>

      <div className="navbar-right">
        <button className="navbar-user" onClick={() => navigate("/profile")}>
          <span className="navbar-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <span className="navbar-info">
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </span>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;