import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UserPlus, AlertCircle, ArrowLeft } from "lucide-react";
import { getProject, addMember, removeMember } from "../api/projects";
import { getErrorMessage } from "../api/axios";
import { useFetch } from "../api/helpers.js";
import { useToast } from "../context/useToast.js";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import MemberList from "../components/MemberList.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import "./ProjectMembers.css";

const ProjectMembers = () => {
  const { projectId } = useParams();
  const toast = useToast();

  const fetchProject = useCallback(() => getProject(projectId), [projectId]);
  const { data, loading, error, setData } = useFetch(fetchProject);

  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  if (loading) return <Loader text="Loading members..." />;
  if (error || !data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Cannot open this project"
        message={error}
        action={<Link to="/projects" className="btn btn-primary">Back to projects</Link>}
      />
    );
  }

  const { project, isOwner } = data;

  const handleAdd = async (e) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) return toast.error("Please enter a valid email");

    setAdding(true);
    try {
      const res = await addMember(project.id, value);
      setData((d) => ({ ...d, project: res.project }));
      setEmail("");
      toast.success("Member added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await removeMember(project.id, toRemove.id);
      setData((d) => ({ ...d, project: res.project }));
      toast.success("Member removed");
      setToRemove(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <Link to={`/projects/${project.id}`} className="back-link">
        <ArrowLeft size={16} /> Back to {project.name}
      </Link>
      <div className="page-header">
        <div>
          <h1>Members</h1>
          <p>{project.members.length + 1} people in this project.</p>
        </div>
      </div>

      <div className="members-layout">
        <section className="card">
          <MemberList
            owner={project.owner}
            members={project.members}
            canRemove={isOwner}
            onRemove={setToRemove}
          />
          {project.members.length === 0 && (
            <p className="members-hint">No collaborators yet. {isOwner ? "Add someone using their email." : ""}</p>
          )}
        </section>

        {isOwner ? (
          <section className="card">
            <h2 className="side-title">Add a member</h2>
            <p className="side-text">The person must already have a CollabSphere account.</p>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label" htmlFor="member-email">Email address</label>
                <input
                  id="member-email"
                  type="email"
                  className="input"
                  placeholder="teammate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-block" disabled={adding}>
                <UserPlus size={16} /> {adding ? "Adding..." : "Add member"}
              </button>
            </form>
          </section>
        ) : (
          <section className="card">
            <h2 className="side-title">Member access</h2>
            <p className="side-text">Only the project owner can add or remove members.</p>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Remove this member?"
        message={toRemove ? `${toRemove.name} will lose access to this project.` : ""}
        confirmText="Remove"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setToRemove(null)}
      />
    </>
  );
};

export default ProjectMembers;