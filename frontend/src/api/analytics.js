import api from "./axios";

export const getAnalytics = async (projectId) => (await api.get(`/analytics/${projectId}`)).data.data;