import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Files,
  Sparkles,
  BarChart3,
  Users,
  Activity as ActivityIcon,
  Pencil,
  Trash2,
  Copy,
  Wand2,
  Globe,
  AlertCircle,
  Calendar,
} from "lucide-react";

import {
  getProject,
  updateProject,
  deleteProject,
  toggleSharing,
} from "../api/projects";

import { getAnalytics } from "../api/analytics";
import { generateReadme } from "../api/gemini";
import { getErrorMessage } from "../api/axios";
import { useFetch, formatDate } from "../api/helpers.js";
import { useToast } from "../context/useToast.js";

import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import MarkdownPreview from "../components/MarkdownPreview.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

import "./ProjectDetails.css";

const isValidMongoId = (id) => {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const validProjectId = isValidMongoId(projectId);

  // Fetch project only when URL contains a valid MongoDB ID.
  const fetchProject = useCallback(() => {
    if (!validProjectId) {
      throw new Error("Invalid project ID in URL");
    }

    return getProject(projectId);
  }, [projectId, validProjectId]);

  // Fetch analytics only when URL contains a valid MongoDB ID.
  const fetchStats = useCallback(() => {
    if (!validProjectId) {
      throw new Error("Invalid project ID in URL");
    }

    return getAnalytics(projectId);
  }, [projectId, validProjectId]);

  const { data, loading, error, setData, reload } = useFetch(fetchProject);

  const { data: stats, reload: reloadStats } = useFetch(fetchStats);

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sharingBusy, setSharingBusy] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Stop invalid IDs before rendering the project page.
  if (!validProjectId) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Invalid project URL"
        message="The project ID is missing or invalid. Please open a project from your projects list."
        action={
          <Link to="/projects" className="btn btn-primary">
            Back to projects
          </Link>
        }
      />
    );
  }

  if (loading) {
    return <Loader text="Loading project..." />;
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Cannot open this project"
        message={error || "Project data could not be loaded."}
        action={
          <Link to="/projects" className="btn btn-primary">
            Back to projects
          </Link>
        }
      />
    );
  }

  const { project, isOwner } = data;

  // Always use MongoDB's actual project ID.
  const projectIdFromDB = project?._id;

  if (!isValidMongoId(projectIdFromDB)) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Invalid project data"
        message="The project response does not contain a valid MongoDB ID."
        action={
          <Link to="/projects" className="btn btn-primary">
            Back to projects
          </Link>
        }
      />
    );
  }

  const members = project.members || [];

  const shareUrl = project.shareToken
    ? `${window.location.origin}/public/project/${project.shareToken}`
    : "";

  const startEdit = () => {
    setForm({
      name: project.name || "",
      description: project.description || "",
    });

    setEditing(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();

    if (form.name.trim().length < 3) {
      return toast.error("Project name must be at least 3 characters");
    }

    setSaving(true);

    try {
      const res = await updateProject(projectIdFromDB, {
        name: form.name.trim(),
        description: form.description.trim(),
      });

      setData((d) => ({
        ...d,
        project: res.project || res,
      }));

      reloadStats();
      setEditing(false);

      toast.success("Project updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await deleteProject(projectIdFromDB);

      toast.success("Project deleted");
      navigate("/projects");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleToggleShare = async () => {
    setSharingBusy(true);

    try {
      const res = await toggleSharing(projectIdFromDB, !project.isPublic);

      setData((d) => ({
        ...d,
        project: {
          ...d.project,
          isPublic: res.isPublic,
          shareToken: res.shareToken,
        },
      }));

      reloadStats();

      toast.success(
        res.isPublic ? "Public sharing enabled" : "Public sharing disabled",
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSharingBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy. Please copy the link manually.");
    }
  };

  const handleGenerateReadme = async () => {
    setGenerating(true);

    try {
      await generateReadme({
        projectId: projectIdFromDB,
        save: true,
      });

      toast.success("README generated and saved");

      reload();
      reloadStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const totals = stats?.totals;

  return (
    <>
      {editing ? (
        <form className="card edit-card" onSubmit={saveEdit}>
          <h2>Edit project</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">
              Name
            </label>

            <input
              id="edit-name"
              className="input"
              maxLength={80}
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-desc">
              Description
            </label>

            <textarea
              id="edit-desc"
              className="input"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="edit-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>

            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="page-header">
          <div>
            <h1>{project.name}</h1>

            <p>{project.description || "No description added."}</p>

            <div className="project-meta">
              <span>
                <Users size={14} /> Owner: {project.owner?.name || "Unknown"}
              </span>

              <span>
                <Calendar size={14} /> Created {formatDate(project.createdAt)}
              </span>

              <span className={isOwner ? "role-pill role-owner" : "role-pill"}>
                {isOwner ? "You are the owner" : "You are a member"}
              </span>
            </div>
          </div>

          {isOwner && (
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={startEdit}>
                <Pencil size={15} /> Edit
              </button>

              <button
                className="btn btn-danger"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon={FileText}
          label="Notes"
          value={totals ? totals.notes : "-"}
          color="primary"
        />

        <StatCard
          icon={Files}
          label="Files"
          value={totals ? totals.files : "-"}
          color="secondary"
        />

        <StatCard
          icon={ActivityIcon}
          label="Activities"
          value={totals ? totals.activities : "-"}
          color="warning"
        />

        <StatCard
          icon={Users}
          label="People"
          value={totals ? totals.members : members.length + 1}
          color="primary"
        />
      </div>

      <div className="quick-links">
        <Link to={`/projects/${projectIdFromDB}/notes`} className="quick-link">
          <FileText size={18} /> Notes
        </Link>

        <Link to={`/projects/${projectIdFromDB}/files`} className="quick-link">
          <Files size={18} /> Files
        </Link>

        <Link
          to={`/projects/${projectIdFromDB}/members`}
          className="quick-link"
        >
          <Users size={18} /> Members
        </Link>

        <Link to={`/projects/${projectIdFromDB}/ai`} className="quick-link">
          <Sparkles size={18} /> AI Assistant
        </Link>

        <Link
          to={`/projects/${projectIdFromDB}/analytics`}
          className="quick-link"
        >
          <BarChart3 size={18} /> Analytics
        </Link>
      </div>

      <div className="details-grid">
        <section className="card readme-card">
          <div className="card-head">
            <h2>README</h2>

            {isOwner && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleGenerateReadme}
                disabled={generating}
              >
                <Wand2 size={15} />

                {generating ? "Generating..." : "Generate with AI"}
              </button>
            )}
          </div>

          <MarkdownPreview
            content={project.readme}
            empty={
              isOwner
                ? "No README yet. Click Generate with AI to create one from your notes and files."
                : "No README yet."
            }
          />
        </section>

        <div className="side-col">
          {isOwner && (
            <section className="card">
              <div className="card-head">
                <h2>Public sharing</h2>

                <span
                  className={
                    project.isPublic ? "share-state on" : "share-state"
                  }
                >
                  {project.isPublic ? "On" : "Off"}
                </span>
              </div>

              <p className="share-text">
                Anyone with the link can view the project name, description,
                README and notes you mark as public. Files and member details
                are never shown.
              </p>

              {project.isPublic && shareUrl && (
                <div className="share-link">
                  <input
                    className="input"
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.target.select()}
                  />

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={copyLink}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              )}

              <button
                className={
                  project.isPublic
                    ? "btn btn-danger btn-block"
                    : "btn btn-primary btn-block"
                }
                onClick={handleToggleShare}
                disabled={sharingBusy}
              >
                <Globe size={15} />

                {sharingBusy
                  ? "Please wait..."
                  : project.isPublic
                    ? "Disable sharing"
                    : "Enable sharing"}
              </button>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this project?"
        message="All notes, files and activity in this project will be permanently deleted. This cannot be undone."
        confirmText="Delete project"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default ProjectDetails;
