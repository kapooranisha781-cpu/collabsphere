import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import File from "../models/File.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import { getAccessibleProject } from "../middleware/projectAccess.js";
import { UPLOAD_DIR, TEXT_EXTENSIONS } from "../config/multer.js";

const loadFile = async (fileId) => {
  if (!mongoose.isValidObjectId(fileId)) throw new ApiError(400, "Invalid file id");
  const file = await File.findById(fileId);
  if (!file) throw new ApiError(404, "File not found");
  return file;
};

// Path traversal se bachne ke liye: final path hamesha UPLOAD_DIR ke andar hi hona chahiye
const safePath = (storedName) => {
  const full = path.resolve(UPLOAD_DIR, storedName);
  if (!full.startsWith(UPLOAD_DIR + path.sep)) throw new ApiError(400, "Invalid file path");
  return full;
};

// POST /api/files/upload/:projectId   (form-data, field name: "file")
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please choose a file to upload");

  try {
    const file = await File.create({
      originalName: path.basename(req.file.originalname),
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      project: req.project._id,
      uploadedBy: req.user._id,
    });
    await logActivity(req.project._id, req.user._id, "file_uploaded", file.originalName);
    await file.populate("uploadedBy", "name email");
    res.status(201).json({ success: true, message: "File uploaded", data: { file } });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {}); // DB fail ho to disk file bhi hatao
    throw error;
  }
});

// GET /api/files/:projectId
export const getFiles = asyncHandler(async (req, res) => {
  await getAccessibleProject(req.params.projectId, req.user);
  const files = await File.find({ project: req.params.projectId })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name email");
  res.json({ success: true, message: "Files fetched", data: { files } });
});

// GET /api/files/download/:fileId
export const downloadFile = asyncHandler(async (req, res) => {
  const file = await loadFile(req.params.fileId);
  await getAccessibleProject(file.project, req.user);
  res.download(safePath(file.storedName), file.originalName);
});

// GET /api/files/content/:fileId   (text files ka preview)
export const getFileContent = asyncHandler(async (req, res) => {
  const file = await loadFile(req.params.fileId);
  await getAccessibleProject(file.project, req.user);

  const ext = path.extname(file.originalName).toLowerCase();
  if (!TEXT_EXTENSIONS.includes(ext)) {
    throw new ApiError(400, "Text preview is only available for text and code files");
  }
  const content = await fs.readFile(safePath(file.storedName), "utf8");
  res.json({
    success: true,
    message: "File content fetched",
    data: { name: file.originalName, extension: ext.slice(1), content },
  });
});

// DELETE /api/files/:fileId   (uploader ya owner)
export const deleteFile = asyncHandler(async (req, res) => {
  const file = await loadFile(req.params.fileId);
  const { isOwner } = await getAccessibleProject(file.project, req.user);

  if (!isOwner && !file.uploadedBy.equals(req.user._id)) {
    throw new ApiError(403, "Only the uploader or project owner can delete this file");
  }
  await fs.unlink(safePath(file.storedName)).catch(() => {});
  await file.deleteOne();
  await logActivity(file.project, req.user._id, "file_deleted", file.originalName);

  res.json({ success: true, message: "File deleted", data: null });
});