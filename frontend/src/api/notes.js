import api from "./axios";

export const getNotes = async (projectId) => (await api.get(`/notes/${projectId}`)).data.data;
export const getNote = async (noteId) => (await api.get(`/notes/detail/${noteId}`)).data.data;
export const createNote = async (payload) => (await api.post("/notes", payload)).data.data;
export const updateNote = async (noteId, payload) => (await api.put(`/notes/${noteId}`, payload)).data.data;
export const deleteNote = async (noteId) => (await api.delete(`/notes/${noteId}`)).data;