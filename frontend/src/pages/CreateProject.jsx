import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createProject } from "../api/projects";
import { getErrorMessage } from "../api/axios";
import { useToast } from "../context/useToast.js";
import "./CreateProject.css";

const CreateProject = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 3) return toast.error("Project name must be at least 3 characters");

    setSubmitting(true);
    try {
      const { project } = await createProject({ name, description: form.description.trim() });
      toast.success("Project created");
      navigate(`/projects/${project.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <>
      <Link to="/projects" className="back-link">
        <ArrowLeft size={16} /> Back to projects
      </Link>
      <div className="page-header">
        <div>
          <h1>Create a new project</h1>
          <p>Give your project a name. You can invite teammates after creating it.</p>
        </div>
      </div>

      <form className="card create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Project name</label>
          <input
            id="name"
            name="name"
            className="input"
            placeholder="MyWebApp"
            maxLength={80}
            value={form.name}
            onChange={handleChange}
          />
          <span className="char-count">{form.name.length}/80</span>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            name="description"
            className="input"
            placeholder="What is this project about?"
            maxLength={500}
            rows={4}
            value={form.description}
            onChange={handleChange}
          />
          <span className="char-count">{form.description.length}/500</span>
        </div>
        <div className="create-actions">
          <Link to="/projects" className="btn btn-secondary">Cancel</Link>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create project"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateProject;