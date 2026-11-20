import api from "./axios";

export const getPublicProject = async (shareToken) =>
  (await api.get(`/public/project/${shareToken}`)).data.data;