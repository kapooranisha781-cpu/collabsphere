
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  File,
  FileCode,
  Image,
  FileText,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  X,
} from "lucide-react";

import {
  getFiles,
  uploadFile,
  deleteFile,
  downloadFile,
  getFileBlob,
} from "../api/files";

import { getErrorMessage } from "../api/axios";
import { useFetch, formatDate } from "../api/helpers.js";
import { useToast } from "../context/useToast.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

import "./ProjectFiles.css";

const CODE_EXTENSIONS = ["js", "py", "html", "css", "json", "md", "txt"];

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getIcon = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();

  if (CODE_EXTENSIONS.includes(ext)) {
    return FileCode;
  }

  if (["png", "jpg", "jpeg"].includes(ext)) {
    return Image;
  }

  if (["pdf"].includes(ext)) {
    return FileText;
  }

  return File;
};

const ProjectFiles = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const fetchFiles = useCallback(
    () => getFiles(projectId),
    [projectId]
  );

  const { data, loading, error, reload } = useFetch(fetchFiles);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const files = data?.files || [];

  // Clean up preview URL when component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Upload file
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      await uploadFile(projectId, file, setProgress);

      toast.success("File uploaded successfully");

      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      setProgress(0);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  // Delete file
  const handleDelete = async () => {
    if (!selected) return;

    setDeleting(true);

    try {
      await deleteFile(selected._id || selected.id);

      toast.success("File deleted successfully");

      setSelected(null);

      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // Preview file
  const handlePreview = async (file) => {
    const fileId = file._id || file.id;
    const fileName = file.originalName || file.name || "Untitled file";

    const ext = fileName.split(".").pop()?.toLowerCase();

    if (CODE_EXTENSIONS.includes(ext)) {
      navigate(`/projects/${projectId}/code/${fileId}`);
      return;
    }

    setPreviewLoading(true);

    try {
      const blob = await getFileBlob(fileId);

      // Remove previous preview URL.
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const url = URL.createObjectURL(blob);

      previewUrlRef.current = url;

      setPreview({
        file,
        url,
        type: file.mimeType || blob.type,
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPreviewLoading(false);
    }
  };

  // Close preview
  const closePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreview(null);
  };

  if (loading) {
    return <Loader text="Loading project files..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to load files"
        message={error}
      />
    );
  }

  return (
    <div className="files-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Project Files</h1>
          <p>Upload, preview and manage your project resources.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={17} />
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".js,.py,.html,.css,.json,.md,.txt,.png,.jpg,.jpeg,.pdf"
        onChange={handleUpload}
      />

      {/* Upload Information */}
      <div className="upload-info">
        <Upload size={18} />

        <div>
          <strong>Upload project files</strong>

          <p>
            Supported: JS, Python, HTML, CSS, JSON, Markdown,
            TXT, PNG, JPG and PDF. Maximum size: 5 MB.
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-label">
            <span>Uploading file...</span>
            <span>{progress}%</span>
          </div>

          <div className="progress-track">
            <div
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length === 0 ? (
        <EmptyState
          icon={File}
          title="No files uploaded"
          message="Upload your first project file to get started."
          action={
            <button
              className="btn btn-primary"
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={16} />
              Upload first file
            </button>
          }
        />
      ) : (
        <div className="files-table-wrap">
          <div className="files-table-heading">
            <h2>Uploaded Files</h2>
            <span>{files.length} files</span>
          </div>

          <div className="files-list">
            {files.map((file) => {
              const fileName =
                file.originalName || file.name || "Untitled file";

              const fileId = file._id || file.id;
              const Icon = getIcon(fileName);

              return (
                <div className="file-row" key={fileId}>
                  <div className="file-main">
                    <div className="file-icon">
                      <Icon size={21} />
                    </div>

                    <div className="file-info">
                      <strong title={fileName}>
                        {fileName}
                      </strong>

                      <small>
                        {formatSize(file.size)} ·{" "}
                        {file.uploadedBy?.name || "Project member"} ·{" "}
                        {file.createdAt
                          ? formatDate(file.createdAt)
                          : "Date unavailable"}
                      </small>
                    </div>
                  </div>

                  {/* File Actions */}
                  <div className="file-actions">
                    <button
                      className="icon-btn"
                      title="Preview"
                      onClick={() => handlePreview(file)}
                      disabled={previewLoading}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      title="Download"
                      onClick={async () => {
                        try {
                          await downloadFile(fileId, fileName);
                        } catch (err) {
                          toast.error(getErrorMessage(err));
                        }
                      }}
                    >
                      <Download size={16} />
                    </button>

                    <button
                      className="icon-btn danger-icon"
                      title="Delete"
                      onClick={() => setSelected(file)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {preview && (
        <div
          className="file-preview-overlay"
          onClick={closePreview}
        >
          <div
            className="file-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="file-preview-header">
              <h3>
                {preview.file.originalName || preview.file.name}
              </h3>

              <button
                className="icon-btn"
                onClick={closePreview}
                title="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            {preview.type?.startsWith("image/") ? (
              <img
                className="file-preview-image"
                src={preview.url}
                alt={preview.file.originalName || "File preview"}
              />
            ) : preview.type === "application/pdf" ? (
              <iframe
                className="file-preview-pdf"
                src={preview.url}
                title={preview.file.originalName || "PDF preview"}
              />
            ) : (
              <p>Preview is not available for this file type.</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(selected)}
        title="Delete this file?"
        message={
          selected
            ? `"${selected.originalName || selected.name}" will be permanently deleted.`
            : ""
        }
        confirmText="Delete file"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSelected(null)}
      />
    </div>
  );
};

export default ProjectFiles;
