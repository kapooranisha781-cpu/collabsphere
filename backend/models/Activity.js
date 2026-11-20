import mongoose from "mongoose";

export const ACTIVITY_ACTIONS = [
  "project_created",
  "project_updated",
  "member_added",
  "member_removed",
  "note_created",
  "note_updated",
  "note_deleted",
  "file_uploaded",
  "file_deleted",
  "ai_used",
  "sharing_enabled",
  "sharing_disabled",
];

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
    // Human-readable label, e.g. the note title or file name
    targetName: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: true }
);

// Fast "recent activity for a project" queries
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);