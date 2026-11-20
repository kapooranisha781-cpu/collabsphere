import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Boxes, FileText, AlertCircle } from "lucide-react";

import { getPublicProject } from "../api/public";
import { useFetch, formatDate } from "../api/helpers.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import MarkdownPreview from "../components/MarkdownPreview.jsx";
import "./PublicProject.css";

const PublicProject = () => {
  const { shareToken } = useParams();

  const fetchProject = useCallback(
    () => getPublicProject(shareToken),
    [shareToken]
  );

  const { data, loading, error } = useFetch(fetchProject);

  if (loading) return <Loader fullscreen text="Loading shared project..." />;

  if (error || !data) {
    return (
      <div className="public-project-page">
        <EmptyState
          icon={AlertCircle}
          title="Project is unavailable"
          message={error || "This project may no longer be shared."}
          action={
            <Link to="/" className="btn btn-primary">
              Go to CollabSphere
            </Link>
          }
        />
      </div>
    );
  }

  const { project, notes = [] } = data;

  return (
    <div className="public-project-page">
      <header className="public-project-nav">
        <Link to="/" className="public-brand">
          <Boxes size={23} /> CollabSphere
        </Link>
        <span>Public project</span>
      </header>

      <main className="public-project-content">
        <section className="public-project-hero">
          <span className="public-label">PUBLIC PROJECT</span>
          <h1>{project.name}</h1>
          <p>{project.description || "No project description available."}</p>
          <small>Created {formatDate(project.createdAt)}</small>
        </section>

        {project.readme && (
          <section className="card public-readme">
            <div className="public-section-title">
              <FileText size={19} />
              <h2>Project README</h2>
            </div>
            <MarkdownPreview content={project.readme} />
          </section>
        )}

        <section className="public-notes-section">
          <div className="public-section-title">
            <FileText size={19} />
            <h2>Public Notes</h2>
            <span>{notes.length}</span>
          </div>

          {notes.length === 0 ? (
            <div className="card public-empty">
              No public notes have been shared yet.
            </div>
          ) : (
            <div className="public-notes-list">
              {notes.map((note) => (
                <article className="card public-note" key={note.id}>
                  <div className="public-note-header">
                    <h3>{note.title}</h3>
                    <small>{formatDate(note.updatedAt)}</small>
                  </div>
                  <MarkdownPreview content={note.content} />
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="public-footer">
        Shared using CollabSphere
      </footer>
    </div>
  );
};

export default PublicProject;