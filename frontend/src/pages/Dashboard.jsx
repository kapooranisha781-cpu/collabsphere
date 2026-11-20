
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Crown,
  UserPlus,
  Plus,
  FolderPlus,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/useAuth.js";
import { getDashboard } from "../api/projects";
import { useFetch } from "../api/helpers.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(getDashboard);

  if (loading) return <Loader text="Loading dashboard..." />;

  if (error || !data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Could not load dashboard"
        message={error || "Something went wrong."}
      />
    );
  }

  const recentProjects = data.recentProjects || [];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p>Here is what is happening across your projects.</p>
        </div>

        <Link to="/projects/new" className="btn btn-primary">
          <Plus size={16} />
          New project
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={FolderKanban}
          label="Total projects"
          value={data.total ?? 0}
          color="primary"
        />

        <StatCard
          icon={Crown}
          label="Projects owned"
          value={data.owned ?? 0}
          color="secondary"
        />

        <StatCard
          icon={UserPlus}
          label="Projects joined"
          value={data.joined ?? 0}
          color="warning"
        />
      </div>

      <section className="dashboard-projects-section">
        <div className="section-head">
          <h2>Recent projects</h2>

          {recentProjects.length > 0 && (
            <Link to="/projects" className="view-all-link">
              View all
            </Link>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <EmptyState
            icon={FolderPlus}
            title="No projects yet"
            message="Create your first project to start writing notes and sharing files."
            action={
              <Link to="/projects/new" className="btn btn-primary">
                Create project
              </Link>
            }
          />
        ) : (
          <div className="project-grid">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
