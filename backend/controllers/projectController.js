import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Note from "../models/Note.js";
import File from "../models/File.js";
import Activity from "../models/Activity.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import { UPLOAD_DIR } from "../config/multer.js";

const populateProject = (query) =>
  query.populate("owner", "name email").populate("members", "name email");

// POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({ name, description, owner: req.user._id });
  await logActivity(project._id, req.user._id, "project_created", project.name);

  const populated = await populateProject(Project.findById(project._id));
  res.status(201).json({ success: true, message: "Project created", data: { project: populated } });
});

// GET /api/projects  (jo mere hain + jisme main member hun)
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const projects = await populateProject(
    Project.find({ $or: [{ owner: userId }, { members: userId }] }).sort({ updatedAt: -1 })
  );
  res.json({ success: true, message: "Projects fetched", data: { projects } });
});

// GET /api/projects/dashboard/summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const filter = { $or: [{ owner: userId }, { members: userId }] };

  const [total, owned, recentProjects, allIds] = await Promise.all([
    Project.countDocuments(filter),
    Project.countDocuments({ owner: userId }),
    populateProject(Project.find(filter).sort({ updatedAt: -1 }).limit(5)),
    Project.find(filter).select("_id"),
  ]);

  const recentActivities = await Activity.find({ project: { $in: allIds.map((p) => p._id) } })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("user", "name")
    .populate("project", "name");

  res.json({
    success: true,
    message: "Dashboard fetched",
    data: { total, owned, joined: total - owned, recentProjects, recentActivities },
  });
});

// GET /api/projects/:projectId   (projectAccess middleware ke baad)
export const getProject = asyncHandler(async (req, res) => {
  const project = await populateProject(Project.findById(req.project._id));
  res.json({
    success: true,
    message: "Project fetched",
    data: { project, isOwner: req.isOwner },
  });
});

// PUT /api/projects/:projectId  (sirf owner)
export const updateProject = asyncHandler(async (req, res) => {
  const { name, description, readme } = req.body;
  const project = req.project;

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (readme !== undefined) project.readme = readme;
  await project.save();

  await logActivity(project._id, req.user._id, "project_updated", project.name);
  const populated = await populateProject(Project.findById(project._id));
  res.json({ success: true, message: "Project updated", data: { project: populated } });
});

// DELETE /api/projects/:projectId  (sirf owner)
export const deleteProject = asyncHandler(async (req, res) => {
  const project = req.project;

  // Disk se files hatao
  const files = await File.find({ project: project._id });
  await Promise.all(
    files.map((f) => fs.unlink(path.join(UPLOAD_DIR, f.storedName)).catch(() => {}))
  );

  await Promise.all([
    Note.deleteMany({ project: project._id }),
    File.deleteMany({ project: project._id }),
    Activity.deleteMany({ project: project._id }),
  ]);
  await project.deleteOne();

  res.json({ success: true, message: "Project deleted", data: null });
});

// POST /api/projects/:projectId/members  (sirf owner) body: { email }
export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const project = req.project;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No registered user found with this email");
  if (project.owner.equals(user._id)) throw new ApiError(400, "Owner is already part of the project");
  if (project.members.some((m) => m.equals(user._id))) {
    throw new ApiError(409, "This user is already a member");
  }

  project.members.push(user._id);
  await project.save();
  await logActivity(project._id, req.user._id, "member_added", user.name);

  const populated = await populateProject(Project.findById(project._id));
  res.status(201).json({ success: true, message: `${user.name} added to project`, data: { project: populated } });
});

// DELETE /api/projects/:projectId/members/:memberId  (sirf owner)
export const removeMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const project = req.project;

  if (!mongoose.isValidObjectId(memberId)) throw new ApiError(400, "Invalid member id");
  if (!project.members.some((m) => m.equals(memberId))) {
    throw new ApiError(404, "This user is not a member of the project");
  }

  const user = await User.findById(memberId);
  project.members.pull(memberId);
  await project.save();
  await logActivity(project._id, req.user._id, "member_removed", user ? user.name : "");

  const populated = await populateProject(Project.findById(project._id));
  res.json({ success: true, message: "Member removed", data: { project: populated } });
});

// PUT /api/projects/:projectId/share  (sirf owner) body: { enabled: true/false }
export const toggleSharing = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const project = req.project;

  if (enabled) {
    if (!project.shareToken) project.shareToken = crypto.randomBytes(24).toString("hex");
    project.isPublic = true;
  } else {
    project.isPublic = false;
  }
  await project.save();
  await logActivity(project._id, req.user._id, enabled ? "sharing_enabled" : "sharing_disabled", project.name);

  res.json({
    success: true,
    message: enabled ? "Public sharing enabled" : "Public sharing disabled",
    data: { isPublic: project.isPublic, shareToken: project.shareToken || null },
  });
});

// GET /api/projects/:projectId/activity
export const getProjectActivity = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ project: req.project._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("user", "name");
  res.json({ success: true, message: "Activity fetched", data: { activities } });
});


// GET /api/projects/activity?page=1&limit=5
// All activities from projects accessible to the logged-in user
export const getRecentActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // User ke accessible projects find karo
  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }],
  }).select("_id");

  const projectIds = projects.map((project) => project._id);

  // Pagination values
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
  const limit = Math.min(20, Math.max(1, requestedLimit));
  const skip = (page - 1) * limit;

  const filter = { project: { $in: projectIds } };

  // Sirf current page ki activities fetch karo
  const [activities, totalActivities] = await Promise.all([
    Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name")
      .populate("project", "name"),
    Activity.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalActivities / limit);

  res.json({
    success: true,
    message: "Recent activities fetched",
    data: {
      activities,
      pagination: {
        currentPage: page,
        limit,
        totalActivities,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});