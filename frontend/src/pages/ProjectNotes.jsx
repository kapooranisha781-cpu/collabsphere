import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, FileText, Pencil, Trash2, AlertCircle } from "lucide-react";
import { getNotes, deleteNote } from "../api/notes";
import { getErrorMessage } from "../api/axios";
import { useFetch, formatDate } from "../api/helpers.js";
import { useToast } from "../context/useToast.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import MarkdownPreview from "../components/MarkdownPreview.jsx";
import "./ProjectNotes.css";

const ProjectNotes = () => {
  const { projectId } = useParams();
  const toast = useToast();

  const fetchNotes = useCallback(() => getNotes(projectId), [projectId]);
  const { data, loading, error, reload } = useFetch(fetchNotes);

  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const notes = data?.notes || [];

  const handleDelete = async () => {
    if (!selected) return;

    setDeleting(true);
    try {
      await deleteNote(selected._id || selected.id);
      toast.success("Note deleted successfully");
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader text="Loading project notes..." />;

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to load notes"
        message={error}
      />
    );
  }

  return (
    <div className="notes-page">
      <div className="page-header">
        <div>
          <h1>Project Notes</h1>
          <p>Create, manage and share your project documentation.</p>
        </div>

        <Link
          to={`/projects/${projectId}/notes/new`}
          className="btn btn-primary"
        >
          <Plus size={17} />
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes created yet"
          message="Create your first Markdown note to document this project."
          action={
            <Link
              to={`/projects/${projectId}/notes/new`}
              className="btn btn-primary"
            >
              <Plus size={16} /> Create first note
            </Link>
          }
        />
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <article className="note-card" key={note._id || note.id}>
              <div className="note-card-top">
                <div className="note-icon">
                  <FileText size={20} />
                </div>

                <div className="note-actions">
                  <Link
                    to={`/projects/${projectId}/notes/${note._id || note.id}/edit`}
                    className="icon-btn"
                    title="Edit note"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    className="icon-btn danger-icon"
                    title="Delete note"
                    onClick={() => setSelected(note)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{note.title}</h3>

              <p className="note-author">
                By {note.author?.name || "Project member"} ·{" "}
                {formatDate(note.updatedAt || note.createdAt)}
              </p>

              <div className="note-excerpt">
                <MarkdownPreview
                  content={(note.content || "").slice(0, 350)}
                  empty="No content added."
                />
              </div>

              <Link
                to={`/projects/${projectId}/notes/${note._id || note.id}/edit`}
                className="note-open-link"
              >
                Open note <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selected)}
        title="Delete this note?"
        message={
          selected
            ? `"${selected.title}" will be permanently deleted.`
            : ""
        }
        confirmText="Delete note"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSelected(null)}
      />
    </div>
  );
};

export default ProjectNotes;