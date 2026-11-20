import { AlertTriangle } from "lucide-react";
import "./ConfirmDialog.css";

// Delete jaise destructive kaam se pehle dikhao
const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={loading ? undefined : onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dialog-icon">
          <AlertTriangle size={22} />
        </div>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;