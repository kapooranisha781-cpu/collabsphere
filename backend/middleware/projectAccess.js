import mongoose from "mongoose";
import Project from "../models/Project.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Reusable helper: project load karo aur check karo user owner/member hai ya nahi
export const getAccessibleProject = async (projectId, user) => {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const isOwner = project.owner.equals(user._id);
  const isMember = project.members.some((m) => m.equals(user._id));
  if (!isOwner && !isMember) {
    throw new ApiError(403, "You do not have access to this project");
  }
  return { project, isOwner };
};

// Route middleware: URL ke :projectId ke liye
export const projectAccess = asyncHandler(async (req, res, next) => {
  const { project, isOwner } = await getAccessibleProject(req.params.projectId, req.user);
  req.project = project;
  req.isOwner = isOwner;
  next();
});

// projectAccess ke BAAD lagao
export const ownerOnly = (req, res, next) => {
  if (!req.isOwner) {
    return next(new ApiError(403, "Only the project owner can do this"));
  }
  next();
};