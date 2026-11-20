import api from "./axios";

export const getFiles = async (projectId) => (await api.get(`/files/${projectId}`)).data.data;

export const uploadFile = async (projectId, file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file); // naam "file" hi hona chahiye (multer ise expect karta hai)
  const res = await api.post(`/files/upload/${projectId}`, formData, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return res.data.data;
};

export const deleteFile = async (fileId) => (await api.delete(`/files/${fileId}`)).data;
export const getFileContent = async (fileId) => (await api.get(`/files/content/${fileId}`)).data.data;

// Download/preview ke liye token chahiye, isliye blob ke roop mein mangwate hain
export const getFileBlob = async (fileId) =>
  (await api.get(`/files/download/${fileId}`, { responseType: "blob" })).data;

export const downloadFile = async (fileId, fileName) => {
  const blob = await getFileBlob(fileId);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};