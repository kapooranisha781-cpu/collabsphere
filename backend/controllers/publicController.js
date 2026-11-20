import Project from "../models/Project.js";
import Note from "../models/Note.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/public/project/:shareToken   (login nahi chahiye, read-only)
export const getPublicProject = asyncHandler(async (req, res) => {
  const { shareToken } = req.params;

  // Token sirf hex string hona chahiye (48 characters), warna DB tak jaane hi mat do
  if (!/^[a-f0-9]{48}$/.test(shareToken)) {
    throw new ApiError(404, "This public project does not exist");
  }

  const project = await Project.findOne({ shareToken, isPublic: true });
  if (!project) throw new ApiError(404, "This public project does not exist or is no longer shared");

  const notes = await Note.find({ project: project._id, isPublic: true })
    .sort({ updatedAt: -1 })
    .select("title content updatedAt");

  // Sirf safe fields: koi owner/member/file/internal info nahi
  res.json({
    success: true,
    message: "Public project fetched",
    data: {
      project: {
        name: project.name,
        description: project.description,
        readme: project.readme,
        createdAt: project.createdAt,
      },
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        updatedAt: n.updatedAt,
      })),
    },
  });
});