import "./EmptyState.css";

// icon: lucide icon component, action: koi bhi button/element
const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="empty-state">
    {Icon && (
      <div className="empty-icon">
        <Icon size={28} />
      </div>
    )}
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export default EmptyState;