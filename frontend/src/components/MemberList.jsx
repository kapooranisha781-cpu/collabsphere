import { Trash2 } from "lucide-react";
import "./MemberList.css";

// owner aur members dikhata hai. Remove button sirf tab jab canRemove true ho (owner ke liye).
const MemberList = ({ owner, members, canRemove, onRemove }) => (
  <ul className="member-list">
    <li className="member-row">
      <span className="member-avatar">{owner.name.charAt(0).toUpperCase()}</span>
      <div className="member-info">
        <strong>{owner.name}</strong>
        <small>{owner.email}</small>
      </div>
      <span className="member-badge">Owner</span>
    </li>

    {members.map((m) => (
      <li key={m.id} className="member-row">
        <span className="member-avatar member-avatar-alt">{m.name.charAt(0).toUpperCase()}</span>
        <div className="member-info">
          <strong>{m.name}</strong>
          <small>{m.email}</small>
        </div>
        {canRemove ? (
          <button className="btn btn-danger btn-sm" onClick={() => onRemove(m)}>
            <Trash2 size={14} /> Remove
          </button>
        ) : (
          <span className="member-badge member-badge-plain">Member</span>
        )}
      </li>
    ))}
  </ul>
);

export default MemberList;