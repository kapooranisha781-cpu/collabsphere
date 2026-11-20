import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Sparkles, BookOpen, WandSparkles, FileText, LoaderCircle
} from "lucide-react";

import {
  explainContent,
  improveContent,
  generateDocs,
  generateReadme,
} from "../api/gemini";

import { getErrorMessage } from "../api/axios";
import { useToast } from "../context/useToast.js";
import MarkdownPreview from "../components/MarkdownPreview.jsx";
import "./GeminiAssistant.css";

const ACTIONS = [
  { id: "explain", label: "Explain Content", icon: BookOpen },
  { id: "improve", label: "Improve Content", icon: WandSparkles },
  { id: "docs", label: "Generate Documentation", icon: FileText },
  { id: "readme", label: "Generate README", icon: Sparkles },
];

const GeminiAssistant = () => {
  const { projectId } = useParams();
  const toast = useToast();

  const [content, setContent] = useState("");
  const [action, setAction] = useState("explain");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveReadme, setSaveReadme] = useState(false);

  const handleGenerate = async () => {
    if (action !== "readme" && !content.trim()) {
      return toast.error("Please enter some content first");
    }

    setLoading(true);
    setResult("");

    try {
      const payload = {
        projectId,
        content: content.trim(),
        language: "general content",
      };

      let response;

      if (action === "explain") {
        response = await explainContent(payload);
      } else if (action === "improve") {
        response = await improveContent(payload);
      } else if (action === "docs") {
        response = await generateDocs(payload);
      } else {
        response = await generateReadme({
          projectId,
          content: content.trim(),
          save: saveReadme,
        });
      }

      setResult(response.result || "No response received.");

      if (response.saved) {
        toast.success("README generated and saved to project");
      } else {
        toast.success("Gemini response generated");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.success("AI response copied");
    } catch {
      toast.error("Unable to copy response");
    }
  };

  const handleUseResult = () => {
    setContent(result);
    setAction("improve");
    toast.info("Response copied into the content editor");
  };

  return (
    <div className="gemini-page">
      <div className="page-header">
        <div>
          <h1>Gemini AI Assistant</h1>
          <p>Understand, improve and document your project with AI.</p>
        </div>
        <div className="gemini-brand-icon">
          <Sparkles size={24} />
        </div>
      </div>

      <div className="gemini-layout">
        <section className="card gemini-input-card">
          <h2>Choose an AI task</h2>

          <div className="gemini-action-grid">
            {ACTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`gemini-action ${action === id ? "selected" : ""}`}
                onClick={() => {
                  setAction(id);
                  setResult("");
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="form-group gemini-content-group">
            <label className="form-label" htmlFor="gemini-content">
              {action === "readme"
                ? "Additional project details (optional)"
                : "Enter your content"}
            </label>

            <textarea
              id="gemini-content"
              className="input gemini-textarea"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                action === "readme"
                  ? "Add extra project details, technologies or installation notes..."
                  : "Paste your notes, documentation or code here..."
              }
            />
          </div>

          {action === "readme" && (
            <label className="save-readme-option">
              <input
                type="checkbox"
                checked={saveReadme}
                onChange={(e) => setSaveReadme(e.target.checked)}
              />
              Save generated README to this project
            </label>
          )}

          <button
            type="button"
            className="btn btn-primary gemini-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Sparkles size={17} />
            )}
            {loading ? "Generating..." : "Generate with Gemini"}
          </button>
        </section>

        <section className="card gemini-output-card">
          <div className="gemini-output-header">
            <div>
              <h2>AI Response</h2>
              <p>Your generated content will appear here.</p>
            </div>
            {result && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopy}
              >
                Copy
              </button>
            )}
          </div>

          {loading ? (
            <div className="gemini-waiting">
              <LoaderCircle className="spin" size={30} />
              <p>Gemini is processing your request...</p>
            </div>
          ) : result ? (
            <>
              <div className="gemini-result">
                <MarkdownPreview content={result} />
              </div>

              <button
                type="button"
                className="btn btn-secondary gemini-use-btn"
                onClick={handleUseResult}
              >
                Use response in editor
              </button>
            </>
          ) : (
            <div className="gemini-empty">
              <Sparkles size={34} />
              <h3>Ready to assist</h3>
              <p>
                Select an AI task, provide content and generate your response.
              </p>
            </div>
          )}
        </section>
      </div>

      <Link
        to={`/projects/${projectId}`}
        className="back-link gemini-back-link"
      >
        Back to project overview
      </Link>
    </div>
  );
};

export default GeminiAssistant;