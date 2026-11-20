
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
  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  const file = await File.findById(fileId);

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  return file;
};

// Prevent path traversal.
const safePath = (storedName) => {
  const full = path.resolve(UPLOAD_DIR, storedName);

  if (!full.startsWith(UPLOAD_DIR + path.sep)) {
    throw new ApiError(400, "Invalid file path");
  }

  return full;
};

// POST /api/files/upload/:projectId
// Owner and members can upload files.
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please choose a file to upload");
  }

  try {
    const file = await File.create({
      originalName: path.basename(req.file.originalname),
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      project: req.project._id,
      uploadedBy: req.user._id,
    });

    await logActivity(
      req.project._id,
      req.user._id,
      "file_uploaded",
      file.originalName
    );

    await file.populate("uploadedBy", "name email");

    res.status(201).json({
      success: true,
      message: "File uploaded",
      data: { file },
    });
  } catch (error) {
    // Remove uploaded disk file if database save fails.
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

// GET /api/files/:projectId
// Owner and members can view project files.
export const getFiles = asyncHandler(async (req, res) => {
  await getAccessibleProject(req.params.projectId, req.user);

  const files = await File.find({
    project: req.params.projectId,
  })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name email");

  res.json({
    success: true,
    message: "Files fetched",
    data: { files },
  });
});

// GET /api/files/download/:fileId
// Owner and members can download files.
export const downloadFile = asyncHandler(async (req, res) => {
  const file = await loadFile(req.params.fileId);

  await getAccessibleProject(file.project, req.user);

  res.download(
    safePath(file.storedName),
    file.originalName
  );
});

// GET /api/files/content/:fileId
// Owner and members can preview text/code files.
export const getFileContent = asyncHandler(async (req, res) => {
  const file = await loadFile(req.params.fileId);

  await getAccessibleProject(file.project, req.user);

  const ext = path.extname(file.originalName).toLowerCase();

  if (!TEXT_EXTENSIONS.includes(ext)) {
    throw new ApiError(
      400,
      "Text preview is only available for text and code files"
    );
  }

  const content = await fs.readFile(
    safePath(file.storedName),
    "utf8"
  );

  res.json({
    success: true,
    message: "File content fetched",
    data: {
      name: file.originalName,
      extension: ext.slice(1),
      content,
    },
  });
});

// DELETE /api/files/:fileId
// Only project owner can delete files.
export const deleteFile = asyncHandler(async (req, res) => {
  const file = await loadFile(req.params.fileId);

  const { isOwner } = await getAccessibleProject(
    file.project,
    req.user
  );

  if (!isOwner) {
    throw new ApiError(
      403,
      "Only the project owner can delete files"
    );
  }

  await fs.unlink(
    safePath(file.storedName)
  ).catch(() => {});

  await file.deleteOne();

  await logActivity(
    file.project,
    req.user._id,
    "file_deleted",
    file.originalName
  );

  res.json({
    success: true,
    message: "File deleted",
    data: null,
  });
});
