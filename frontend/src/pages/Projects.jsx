
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  FolderPlus,
  SearchX,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/useAuth.js";
import { getProjects } from "../api/projects";
import { useFetch } from "../api/helpers.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import "./Projects.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "owned", label: "Owned" },
  { key: "joined", label: "Joined" },
];

const Projects = () => {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(getProjects);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Handle both API response formats
const projects = useMemo(() => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.projects)) {
    return data.projects;
  }

  return [];
}, [data]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const currentUserId = String(user?._id || user?.id || "");

    return projects.filter((project) => {
      const owner = project?.owner;

      const ownerId = String(
        owner?._id || owner?.id || owner || ""
      );

      const isOwner =
        currentUserId !== "" && ownerId === currentUserId;

      if (filter === "owned" && !isOwner) return false;
      if (filter === "joined" && isOwner) return false;

      const name = String(project?.name || "").toLowerCase();
      const description = String(
        project?.description || ""
      ).toLowerCase();

      return (
        !query ||
        name.includes(query) ||
        description.includes(query)
      );
    });
  }, [projects, search, filter, user]);

  if (loading) {
    return <Loader text="Loading projects..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Could not load projects"
        message={error || "Something went wrong."}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Could not load projects"
        message="No project data received from the server."
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>All projects you own or have joined.</p>
        </div>

        <Link to="/projects/new" className="btn btn-primary">
          <Plus size={16} /> New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          message="Create a project, or ask a teammate to add you to theirs."
          action={
            <Link to="/projects/new" className="btn btn-primary">
              Create project
            </Link>
          }
        />
      ) : (
        <>
          <div className="projects-toolbar">
            <div className="search-box">
              <Search size={16} />

              <input
                className="input"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={
                    filter === item.key
                      ? "filter-tab active"
                      : "filter-tab"
                  }
                  onClick={() => setFilter(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching projects"
              message="Try a different search or filter."
            />
          ) : (
            <div className="project-grid">
              {visible.map((project, index) => (
                <ProjectCard
                  key={project._id || project.id || `project-${index}`}
                  project={project}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Projects;
