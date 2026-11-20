
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderPlus,
  FolderPen,
  UserPlus,
  UserMinus,
  FilePlus,
  FilePen,
  FileX,
  Upload,
  Sparkles,
  Share2,
  Share,
} from "lucide-react";

import api, { getErrorMessage } from "../api/axios.js";
import "./RecentActivity.css";

const LIMIT = 10;

const actionConfig = {
  project_created: {
    label: "created project",
    icon: FolderPlus,
    color: "purple",
  },
  project_updated: {
    label: "updated project",
    icon: FolderPen,
    color: "purple",
  },
  member_added: {
    label: "added a member to",
    icon: UserPlus,
    color: "cyan",
  },
  member_removed: {
    label: "removed a member from",
    icon: UserMinus,
    color: "red",
  },
  note_created: {
    label: "created note",
    icon: FilePlus,
    color: "cyan",
  },
  note_updated: {
    label: "updated note",
    icon: FilePen,
    color: "purple",
  },
  note_deleted: {
    label: "deleted note",
    icon: FileX,
    color: "red",
  },
  file_uploaded: {
    label: "uploaded file",
    icon: Upload,
    color: "cyan",
  },
  file_deleted: {
    label: "deleted file",
    icon: FileX,
    color: "red",
  },
  ai_used: {
    label: "used AI Assistant in",
    icon: Sparkles,
    color: "purple",
  },
  sharing_enabled: {
    label: "enabled public sharing for",
    icon: Share2,
    color: "cyan",
  },
  sharing_disabled: {
    label: "disabled public sharing for",
    icon: Share,
    color: "red",
  },
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalActivities: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchActivities = async () => {
      setLoading(true);

      try {
        const response = await api.get("/projects/activity", {
          params: {
            page: pagination.currentPage,
            limit: LIMIT,
          },
        });

        if (cancelled) return;

        const data = response.data.data;

        setActivities(data.activities || []);
        setPagination(data.pagination);
        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      cancelled = true;
    };
  }, [pagination.currentPage, reloadKey]);

  const changePage = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError("");

    setPagination((prev) => ({
      ...prev,
      currentPage: nextPage,
    }));
  };

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="recent-activity-page">

      {/* Header */}
      <div className="activity-header">
        <div>
          <span className="activity-eyebrow">
            WORKSPACE UPDATES
          </span>

          <h1>Recent Activity</h1>

          <p>
            Stay updated with everything happening across your projects.
          </p>
        </div>

        <div className="activity-header-icon">
          <Activity size={27} />
        </div>
      </div>

      {/* Summary */}
      <div className="activity-summary">
        <div>
          <span>Total Activities</span>
          <strong>{pagination.totalActivities}</strong>
        </div>

        <div>
          <span>Current Page</span>
          <strong>
            {pagination.totalPages === 0
              ? 0
              : pagination.currentPage}{" "}
            / {pagination.totalPages}
          </strong>
        </div>
      </div>

      {/* Timeline Heading */}
      <div className="activity-list-header">
        <h2>Activity Timeline</h2>
        <span>Latest updates first</span>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="activity-state">
          <div className="activity-spinner" />
          <p>Loading activities...</p>
        </div>

      ) : error ? (
        /* Error */
        <div className="activity-state activity-error">
          <Activity size={35} />
          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button onClick={retry}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>

      ) : activities.length === 0 ? (
        /* Empty State */
        <div className="activity-state">
          <Activity size={38} />
          <h3>No activities yet</h3>
          <p>
            Project activities will appear here when something happens.
          </p>
        </div>

      ) : (
        <>
          {/* Activity Cards */}
          <div className="activity-timeline">
            {activities.map((item) => {
              const config = actionConfig[item.action] || {
                label: item.action?.replaceAll("_", " ") || "performed an action",
                icon: Activity,
                color: "purple",
              };

              const ActionIcon = config.icon;

              return (
                <div className="activity-card" key={item._id}>

                  <div className={`activity-dot activity-${config.color}`}>
                    <ActionIcon size={17} />
                  </div>

                  <div className="activity-card-content">

                    <div className="activity-card-top">
                      <p>
                        <strong>
                          {item.user?.name || "Someone"}
                        </strong>{" "}
                        {config.label}

                        {item.targetName && (
                          <>
                            {" "}
                            <strong className="activity-target">
                              {item.targetName}
                            </strong>
                          </>
                        )}
                      </p>

                      <span className="activity-date">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="activity-card-bottom">
                      <span className={`activity-badge activity-badge-${config.color}`}>
                        <ActionIcon size={12} />
                        {item.action?.replaceAll("_", " ") || "Activity"}
                      </span>

                      {item.project && (
                        <Link
                          to={`/projects/${item.project._id}`}
                          className="activity-project"
                        >
                          <span>Project:</span>
                          {item.project.name}
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="activity-pagination">

            <button
              onClick={() =>
                changePage(pagination.currentPage - 1)
              }
              disabled={!pagination.hasPrevPage || loading}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <span>
              Page <strong>{pagination.currentPage}</strong> of{" "}
              <strong>{pagination.totalPages}</strong>
            </span>

            <button
              onClick={() =>
                changePage(pagination.currentPage + 1)
              }
              disabled={!pagination.hasNextPage || loading}
            >
              Next
              <ChevronRight size={18} />
            </button>

          </div>
        </>
      )}
    </div>
  );
};

export default RecentActivity;
