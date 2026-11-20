
import { Activity } from "lucide-react";
import EmptyState from "./EmptyState.jsx";
import { timeAgo } from "../api/helpers.js";
import "./ActivityFeed.css";

const ACTION_TEXT = {
  project_created: "created the project",
  project_updated: "updated the project",
  member_added: "added member",
  member_removed: "removed member",
  note_created: "created note",
  note_updated: "updated note",
  note_deleted: "deleted note",
  file_uploaded: "uploaded file",
  file_deleted: "deleted file",
  ai_used: "used AI:",
  sharing_enabled: "enabled public sharing for",
  sharing_disabled: "disabled public sharing for",
};

const ActivityFeed = ({ activities = [], showProject = false }) => {
  if (!Array.isArray(activities) || activities.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        message="Actions in your projects will show up here."
      />
    );
  }

  return (
    <ul className="activity-list">
      {activities.map((a, index) => {
        const activityId =
          a._id || a.id || `${a.action}-${a.createdAt}-${index}`;

        return (
          <li key={activityId} className="activity-item">
            <span className="activity-dot">
              {(a.user?.name || "?").charAt(0).toUpperCase()}
            </span>

            <div className="activity-body">
              <p>
                <strong>{a.user?.name || "Someone"}</strong>{" "}
                {ACTION_TEXT[a.action] || a.action || "performed an action"}

                {a.targetName && (
                  <span className="activity-target">
                    {" "}"{a.targetName}"
                  </span>
                )}

                {showProject && a.project?.name && (
                  <span className="activity-project">
                    {" "}in {a.project.name}
                  </span>
                )}
              </p>

              <small>
                {a.createdAt ? timeAgo(a.createdAt) : "Recently"}
              </small>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ActivityFeed;
