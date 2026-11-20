import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true, trim: true }, // what the user sees
    storedName: { type: String, required: true, unique: true }, // random name on disk (we generate it)
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // bytes
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);