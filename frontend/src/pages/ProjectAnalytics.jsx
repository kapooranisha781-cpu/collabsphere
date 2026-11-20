
import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  Files,
  Activity,
  Users,
  AlertCircle,
  BarChart3,
} from "lucide-react";

import { getAnalytics } from "../api/analytics";
import { useFetch } from "../api/helpers.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";
import "./ProjectAnalytics.css";

const ProjectAnalytics = () => {
  const { projectId } = useParams();

  const fetchAnalytics = useCallback(() => {
    if (!projectId) {
      return Promise.reject(
        new Error("Project ID is missing from the URL.")
      );
    }

    return getAnalytics(projectId);
  }, [projectId]);

  const { data, loading, error } = useFetch(fetchAnalytics);

  if (loading) {
    return <Loader text="Loading project analytics..." />;
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to load analytics"
        message={error || "Analytics data is not available."}
      />
    );
  }

  const totals = data.totals || {};
  const memberStats = Array.isArray(data.memberStats)
    ? data.memberStats
    : [];
  const activityByDay = Array.isArray(data.activityByDay)
    ? data.activityByDay
    : [];
  const recentActivities = Array.isArray(data.recentActivities)
    ? data.recentActivities
    : [];

  const maxActivity = Math.max(
    1,
    ...activityByDay.map((day) => day.count || 0)
  );

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>
            Project <span>Analytics</span>
          </h1>
          <p>
            Understand your team's project activity and contributions.
          </p>
        </div>

        <BarChart3 size={28} className="analytics-header-icon" />
      </div>

      <div className="analytics-stats">
        <StatCard
          icon={FileText}
          label="Total Notes"
          value={totals.notes ?? 0}
          color="primary"
        />

        <StatCard
          icon={Files}
          label="Total Files"
          value={totals.files ?? 0}
          color="secondary"
        />

        <StatCard
          icon={Activity}
          label="Total Activities"
          value={totals.activities ?? 0}
          color="warning"
        />

        <StatCard
          icon={Users}
          label="Team Members"
          value={totals.members ?? 0}
          color="primary"
        />
      </div>

      <div className="analytics-grid">
        <section className="card analytics-chart-card">
          <div className="analytics-section-heading">
            <div>
              <h2>Activity in the last 7 days</h2>
              <p>Project activity by day</p>
            </div>
          </div>

          {activityByDay.length === 0 ? (
            <p className="analytics-no-data">
              No activity data available yet.
            </p>
          ) : (
            <div className="activity-chart">
              {activityByDay.map((day, index) => (
                <div
                  className="chart-column"
                  key={day.date || index}
                >
                  <strong>{day.count || 0}</strong>

                  <div className="chart-bar-track">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(
                          5,
                          ((day.count || 0) / maxActivity) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <span>
                    {day.label ||
                      new Date(day.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                      })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card member-stats-card">
          <h2>Member Contributions</h2>
          <p className="analytics-subtitle">
            Team activity summary
          </p>

          {memberStats.length === 0 ? (
            <p className="analytics-no-data">
              No contribution data yet.
            </p>
          ) : (
            <div className="member-stat-list">
              {memberStats.map((member, index) => (
                <div
                  className="member-stat-row"
                  key={member.id || member._id || index}
                >
                  <div className="member-stat-avatar">
                    {(member.name || "?").charAt(0).toUpperCase()}
                  </div>

                  <div className="member-stat-info">
                    <strong>{member.name || "Team member"}</strong>
                    <span>
                      {member.count ?? member.activities ?? 0} activities
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card analytics-recent-card">
        <div className="analytics-section-heading">
          <div>
            <h2>Recent Project Activity</h2>
            <p>Latest actions performed by your team.</p>
          </div>

          <Link
            to={`/projects/${projectId}`}
            className="analytics-view-link"
          >
            Project overview
          </Link>
        </div>

        <ActivityFeed activities={recentActivities} />
      </section>
    </div>
  );
};

export default ProjectAnalytics;
