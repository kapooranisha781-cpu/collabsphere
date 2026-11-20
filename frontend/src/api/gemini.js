import api from "./axios";

export const explainContent = async (payload) => (await api.post("/gemini/explain", payload)).data.data;
export const generateDocs = async (payload) => (await api.post("/gemini/docs", payload)).data.data;
export const improveContent = async (payload) => (await api.post("/gemini/improve", payload)).data.data;
export const generateReadme = async (payload) => (await api.post("/gemini/readme", payload)).data.data;