import api from "./axios";

export const getProjects = async () => (await api.get("/projects")).data.data;
export const getDashboard = async () => (await api.get("/projects/dashboard/summary")).data.data;
export const getProject = async (id) => (await api.get(`/projects/${id}`)).data.data;
export const createProject = async (payload) => (await api.post("/projects", payload)).data.data;
export const updateProject = async (id, payload) => (await api.put(`/projects/${id}`, payload)).data.data;
export const deleteProject = async (id) => (await api.delete(`/projects/${id}`)).data;
export const addMember = async (id, email) => (await api.post(`/projects/${id}/members`, { email })).data.data;
export const removeMember = async (id, memberId) =>
  (await api.delete(`/projects/${id}/members/${memberId}`)).data.data;
export const toggleSharing = async (id, enabled) => (await api.put(`/projects/${id}/share`, { enabled })).data.data;
export const getProjectActivity = async (id) => (await api.get(`/projects/${id}/activity`)).data.data;