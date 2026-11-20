import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import "./Toast.css";

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

const Toast = ({ toasts, onClose }) => (
  <div className="toast-container">
    {toasts.map((t) => {
      const Icon = icons[t.type] || Info;
      return (
        <div key={t.id} className={`toast toast-${t.type}`} role="status">
          <Icon size={18} className="toast-icon" />
          <span className="toast-message">{t.message}</span>
          <button className="toast-close" onClick={() => onClose(t.id)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      );
    })}
  </div>
);

export default Toast;