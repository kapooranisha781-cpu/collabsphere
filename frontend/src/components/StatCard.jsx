import "./StatCard.css";

// color: "primary" | "secondary" | "warning"
const StatCard = ({ icon: Icon, label, value, color = "primary" }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">
      <Icon size={20} />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default StatCard;