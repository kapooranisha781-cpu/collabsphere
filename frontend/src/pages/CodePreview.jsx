import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Copy, Sparkles, FileCode, LoaderCircle
} from "lucide-react";

import { getFileContent } from "../api/files";
import { explainContent } from "../api/gemini";
import { getErrorMessage } from "../api/axios";
import { useFetch } from "../api/helpers.js";
import { useToast } from "../context/useToast.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import MarkdownPreview from "../components/MarkdownPreview.jsx";
import "./CodePreview.css";

const CodePreview = () => {
  const { projectId, fileId } = useParams();
  const toast = useToast();

  const fetchContent = useCallback(
    () => getFileContent(fileId),
    [fileId]
  );

  const { data, loading, error } = useFetch(fetchContent);

  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data?.content || "");
      toast.success("Code copied");
    } catch {
      toast.error("Unable to copy code");
    }
  };

  const handleExplain = async () => {
    if (!data?.content?.trim()) {
      return toast.error("This file has no code to explain");
    }

    setExplaining(true);
    setExplanation("");

    try {
      const response = await explainContent({
        projectId,
        content: data.content,
        language: data.extension,
      });

      setExplanation(response.result || "No explanation received.");
      toast.success("Code explanation generated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExplaining(false);
    }
  };

  if (loading) return <Loader text="Loading code file..." />;

  if (error || !data) {
    return (
      <EmptyState
        icon={FileCode}
        title="Cannot preview this file"
        message={error || "File content is unavailable."}
        action={
          <Link
            to={`/projects/${projectId}/files`}
            className="btn btn-primary"
          >
            Back to files
          </Link>
        }
      />
    );
  }

  return (
    <div className="code-preview-page">
      <Link
        to={`/projects/${projectId}/files`}
        className="back-link"
      >
        <ArrowLeft size={16} /> Back to project files
      </Link>

      <div className="page-header">
        <div>
          <h1>{data.name}</h1>
          <p>Code preview · {data.extension.toUpperCase()}</p>
        </div>

        <div className="code-header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleCopy}
          >
            <Copy size={16} /> Copy Code
          </button>

          <button
            className="btn btn-primary"
            onClick={handleExplain}
            disabled={explaining}
          >
            {explaining ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {explaining ? "Explaining..." : "Explain with Gemini"}
          </button>
        </div>
      </div>

      <div className="code-window">
        <div className="code-window-top">
          <div className="code-dots">
            <span />
            <span />
            <span />
          </div>
          <span>{data.name}</span>
        </div>

        <pre className="code-content">
          <code>{data.content}</code>
        </pre>
      </div>

      {explanation && (
        <section className="code-explanation card">
          <div className="explanation-heading">
            <Sparkles size={19} />
            <h2>Gemini Code Explanation</h2>
          </div>

          <MarkdownPreview content={explanation} />
        </section>
      )}
    </div>
  );
};

export default CodePreview;