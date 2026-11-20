
import mongoose from "mongoose";
import Note from "../models/Note.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import { getAccessibleProject } from "../middleware/projectAccess.js";

const loadNote = async (noteId) => {
  if (!mongoose.isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  const note = await Note.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return note;
};

// POST /api/notes
// Owner and members can create notes.
export const createNote = asyncHandler(async (req, res) => {
  const { projectId, title, content, isPublic } = req.body;

  const { isOwner } = await getAccessibleProject(projectId, req.user);

  // Only owner can create a public note.
  if (isPublic && !isOwner) {
    throw new ApiError(
      403,
      "Only the project owner can make a note public"
    );
  }

  const note = await Note.create({
    title,
    content,
    project: projectId,
    author: req.user._id,
    isPublic: Boolean(isPublic),
  });

  await logActivity(
    projectId,
    req.user._id,
    "note_created",
    note.title
  );

  const populated = await note.populate("author", "name email");

  res.status(201).json({
    success: true,
    message: "Note created",
    data: { note: populated },
  });
});

// GET /api/notes/:projectId
// Owner and members can view all project notes.
export const getNotes = asyncHandler(async (req, res) => {
  await getAccessibleProject(req.params.projectId, req.user);

  const notes = await Note.find({
    project: req.params.projectId,
  })
    .sort({ updatedAt: -1 })
    .populate("author", "name email");

  res.json({
    success: true,
    message: "Notes fetched",
    data: { notes },
  });
});

// GET /api/notes/detail/:noteId
export const getNote = asyncHandler(async (req, res) => {
  const note = await loadNote(req.params.noteId);

  await getAccessibleProject(note.project, req.user);

  await note.populate("author", "name email");

  res.json({
    success: true,
    message: "Note fetched",
    data: { note },
  });
});

// PUT /api/notes/:noteId
// Any project member can edit any project note.
export const updateNote = asyncHandler(async (req, res) => {
  const note = await loadNote(req.params.noteId);

  const { isOwner } = await getAccessibleProject(
    note.project,
    req.user
  );

  const { title, content, isPublic } = req.body;

  if (title !== undefined) {
    note.title = title;
  }

  if (content !== undefined) {
    note.content = content;
  }

  // Only owner can change public/private visibility.
  if (isPublic !== undefined) {
    if (!isOwner) {
      throw new ApiError(
        403,
        "Only the project owner can change note visibility"
      );
    }

    note.isPublic = isPublic;
  }

  await note.save();

  await logActivity(
    note.project,
    req.user._id,
    "note_updated",
    note.title
  );

  await note.populate("author", "name email");

  res.json({
    success: true,
    message: "Note updated",
    data: { note },
  });
});

// DELETE /api/notes/:noteId
// Only project owner can delete notes.
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await loadNote(req.params.noteId);

  const { isOwner } = await getAccessibleProject(
    note.project,
    req.user
  );

  if (!isOwner) {
    throw new ApiError(
      403,
      "Only the project owner can delete notes"
    );
  }

  await note.deleteOne();

  await logActivity(
    note.project,
    req.user._id,
    "note_deleted",
    note.title
  );

  res.json({
    success: true,
    message: "Note deleted",
    data: null,
  });
});
