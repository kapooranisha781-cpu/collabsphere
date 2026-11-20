
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  User,
  Users,
  FileText,
  Files,
  Sparkles,
  BarChart3,
  Layers,
  X,
  Boxes,
  Activity,
} from "lucide-react";

import "./Sidebar.css";

const Sidebar = ({ open, onClose }) => {
  const { pathname } = useLocation();

  // Extract projectId from URL
  const match = pathname.match(/^\/projects\/([a-f0-9]{24})/);
  const projectId = match ? match[1] : null;

  // Navigation link styling
  const linkClass = ({ isActive }) =>
    isActive ? "side-link active" : "side-link";

  // Project navigation links
  const projectLinks = projectId
    ? [
        {
          to: `/projects/${projectId}`,
          label: "Overview",
          icon: Layers,
          end: true,
        },
        {
          to: `/projects/${projectId}/members`,
          label: "Members",
          icon: Users,
        },
        {
          to: `/projects/${projectId}/notes`,
          label: "Notes",
          icon: FileText,
        },
        {
          to: `/projects/${projectId}/files`,
          label: "Files",
          icon: Files,
        },
        {
          to: `/projects/${projectId}/ai`,
          label: "AI Assistant",
          icon: Sparkles,
        },
        {
          to: `/projects/${projectId}/analytics`,
          label: "Analytics",
          icon: BarChart3,
        },
      ]
    : [];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={open ? "sidebar open" : "sidebar"}>

        {/* Sidebar Header */}
        <div className="sidebar-top">
          <NavLink
            to="/dashboard"
            className="sidebar-brand"
            onClick={onClose}
          >
            <Boxes size={24} />
            <span>CollabSphere</span>
          </NavLink>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">

          {/* Workspace Section */}
          <p className="side-heading">
            WORKSPACE
          </p>

          <NavLink
            to="/dashboard"
            className={linkClass}
            onClick={onClose}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/projects"
            end
            className={linkClass}
            onClick={onClose}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/recent-activity"
            className={linkClass}
            onClick={onClose}
          >
            <Activity size={18} />
            <span>Recent Activity</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={linkClass}
            onClick={onClose}
          >
            <User size={18} />
            <span>Profile</span>
          </NavLink>

          {/* Current Project Section */}
          {projectId && (
            <>
              <p className="side-heading project-heading">
                CURRENT PROJECT
              </p>

              {projectLinks.map(
                ({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={linkClass}
                    onClick={onClose}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                )
              )}
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <Sparkles size={17} />
          </div>

          <div>
            <strong>CollabSphere</strong>
            <p>Build together. Grow together.</p>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
