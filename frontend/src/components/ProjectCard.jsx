import { Link } from "react-router-dom";
import { Users, Calendar, Globe } from "lucide-react";
import { useAuth } from "../context/useAuth.js";
import { formatDate } from "../api/helpers.js";
import "./ProjectCard.css";

const ProjectCard = ({ project }) => {
  const { user } = useAuth();

  const ownerId = project.owner?._id || project.owner?.id;
  const currentUserId = user?._id || user?.id;
  const isOwner = String(ownerId) === String(currentUserId);

  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="pc-top">
        <h3>{project.name}</h3>
        <span className={isOwner ? "pc-badge pc-owner" : "pc-badge"}>
          {isOwner ? "Owner" : "Member"}
        </span>
      </div>

      <p className="pc-desc">
        {project.description || "No description added."}
      </p>

      <div className="pc-meta">
        <span>
          <Users size={14} /> {project.members.length + 1}
        </span>

        <span>
          <Calendar size={14} /> {formatDate(project.createdAt)}
        </span>

        {project.isPublic && (
          <span className="pc-public">
            <Globe size={14} /> Public
          </span>
        )}
      </div>

      <div className="pc-owner-line">
        by {project.owner?.name}
      </div>
    </Link>
  );
};

export default ProjectCard;