import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Sparkles,
  WandSparkles,
  BookOpen,
  LoaderCircle,
} from "lucide-react";

import { createNote, getNote, updateNote } from "../api/notes";
import {
  explainContent,
  improveContent,
  generateDocs,
} from "../api/gemini";
import { getErrorMessage } from "../api/axios";
import { getProject } from "../api/projects";
import { useToast } from "../context/useToast.js";
import Loader from "../components/Loader.jsx";
import MarkdownPreview from "../components/MarkdownPreview.jsx";
import "./MarkdownEditor.css";

const MarkdownEditor = () => {
  const { projectId, noteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEditing = Boolean(noteId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(
    "# My Project Note\n\nStart writing your documentation here..."
  );
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [activeTab, setActiveTab] = useState("write");

  const loadPage = useCallback(async () => {
    try {
      const projectData = await getProject(projectId);
      setProject(projectData.project);

      if (isEditing) {
        const noteData = await getNote(noteId);
        setTitle(noteData.note.title);
        setContent(noteData.note.content || "");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
      navigate(`/projects/${projectId}/notes`);
    } finally {
      setLoading(false);
    }
  }, [projectId, noteId, isEditing, navigate, toast]);

useEffect(() => {
  const timer = setTimeout(() => {
    loadPage();
  }, 0);

  return () => clearTimeout(timer);
}, [loadPage]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (title.trim().length < 2) {
      return toast.error("Please enter a note title");
    }

    setSaving(true);

    try {
      if (isEditing) {
        await updateNote(noteId, {
          title: title.trim(),
          content,
        });
        toast.success("Note updated successfully");
      } else {
        await createNote({
          projectId,
          title: title.trim(),
          content,
        });
        toast.success("Note created successfully");
      }

      navigate(`/projects/${projectId}/notes`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const runAI = async (action) => {
    if (!content.trim()) {
      return toast.error("Please write some content first");
    }

    setAiLoading(action);
    setAiResult("");

    try {
      const payload = {
        projectId,
        content,
        language: "Markdown documentation",
      };

      let response;

      if (action === "explain") {
        response = await explainContent(payload);
      } else if (action === "improve") {
        response = await improveContent(payload);
      } else {
        response = await generateDocs(payload);
      }

      setAiResult(response.result || "No response received.");
      toast.success("Gemini response generated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAiLoading("");
    }
  };

  if (loading) return <Loader text="Opening note..." />;

  return (
    <div className="editor-page">
      <Link
        to={`/projects/${projectId}/notes`}
        className="back-link"
      >
        <ArrowLeft size={16} /> Back to notes
      </Link>

      <div className="page-header editor-header">
        <div>
          <h1>{isEditing ? "Edit Note" : "Create Note"}</h1>
          <p>{project?.name || "Project documentation"}</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-group editor-title-group">
          <label className="form-label" htmlFor="note-title">
            Note title
          </label>
          <input
            id="note-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your note title..."
            maxLength={120}
            required
          />
        </div>

        <div className="editor-toolbar">
          <div className="editor-tabs">
            <button
              type="button"
              className={activeTab === "write" ? "active" : ""}
              onClick={() => setActiveTab("write")}
            >
              <Edit3 size={15} /> Write
            </button>

            <button
              type="button"
              className={activeTab === "preview" ? "active" : ""}
              onClick={() => setActiveTab("preview")}
            >
              <Eye size={15} /> Preview
            </button>
          </div>

          <span className="editor-format-label">Markdown supported</span>
        </div>

        {activeTab === "write" ? (
          <textarea
            className="markdown-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your Markdown content here..."
            spellCheck="false"
          />
        ) : (
          <div className="markdown-preview-panel">
            <MarkdownPreview content={content} />
          </div>
        )}

        <div className="markdown-hint">
          Supports headings, bold, italic, lists, links, tables and code blocks.
        </div>

        <div className="ai-tools card">
          <div className="ai-tools-heading">
            <div className="ai-heading-icon">
              <Sparkles size={19} />
            </div>
            <div>
              <h2>Gemini AI Assistant</h2>
              <p>Get help with your note content.</p>
            </div>
          </div>

          <div className="ai-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={Boolean(aiLoading)}
              onClick={() => runAI("explain")}
            >
              {aiLoading === "explain" ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <BookOpen size={16} />
              )}
              Explain Note
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={Boolean(aiLoading)}
              onClick={() => runAI("improve")}
            >
              {aiLoading === "improve" ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <WandSparkles size={16} />
              )}
              Improve Note
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={Boolean(aiLoading)}
              onClick={() => runAI("docs")}
            >
              {aiLoading === "docs" ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              Generate Documentation
            </button>
          </div>

          {aiLoading && (
            <p className="ai-loading-text">
              Gemini is working on your content...
            </p>
          )}

          {aiResult && (
            <div className="ai-result">
              <div className="ai-result-top">
                <h3>Gemini Response</h3>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setContent(aiResult)}
                >
                  Use in editor
                </button>
              </div>
              <MarkdownPreview content={aiResult} />
            </div>
          )}
        </div>

        <div className="editor-bottom-actions">
          <Link
            to={`/projects/${projectId}/notes`}
            className="btn btn-secondary"
          >
            Cancel
          </Link>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkdownEditor;