import Note from "../models/Note.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../utils/logActivity.js";
import { askGemini } from "../utils/gemini.js";
import { getAccessibleProject } from "../middleware/projectAccess.js";

const RULES = "Use clear Markdown formatting. Do not invent facts that are not in the provided content.";

const explainCode = {
  system: `You are a friendly senior developer teaching a beginner. ${RULES}`,
  build: (content, language) =>
    `Explain the following ${language || "code or note"} in simple, beginner-friendly English. ` +
    `Start with a short summary, then explain step by step, and mention any important concepts.\n\n` +
    `---\n${content}\n---`,
};

const docsPrompt = {
  system: `You are a technical writer. ${RULES}`,
  build: (content, language) =>
    `Generate structured technical documentation for the following ${language || "content"}. ` +
    `Include: Overview, Code Structure, Function descriptions, Parameters, Return values, and Usage example (if applicable).\n\n` +
    `---\n${content}\n---`,
};

const improvePrompt = {
  system: `You are an experienced editor and code reviewer. ${RULES}`,
  build: (content, language) =>
    `Review the following ${language || "content"} and suggest improvements for grammar, clarity, formatting, ` +
    `code readability and documentation quality. Give a short list of suggestions, then an improved version.\n\n` +
    `---\n${content}\n---`,
};

// Teeno endpoints ka kaam ek jaisa hai, isliye ek factory
const makeHandler = (prompt, doneMessage) =>
  asyncHandler(async (req, res) => {
    const { projectId, content, language } = req.body;
    await getAccessibleProject(projectId, req.user);

    const result = await askGemini({
      systemInstruction: prompt.system,
      prompt: prompt.build(content, language),
    });
    await logActivity(projectId, req.user._id, "ai_used", doneMessage);

    res.json({ success: true, message: doneMessage, data: { result } });
  });

// POST /api/gemini/explain
export const explain = makeHandler(explainCode, "Explanation generated");
// POST /api/gemini/docs
export const docs = makeHandler(docsPrompt, "Documentation generated");
// POST /api/gemini/improve
export const improve = makeHandler(improvePrompt, "Improvement suggestions generated");

// POST /api/gemini/readme   body: { projectId, content?, save? }
export const readme = asyncHandler(async (req, res) => {
  const { projectId, content, save } = req.body;
  const { project, isOwner } = await getAccessibleProject(projectId, req.user);

  const [notes, files] = await Promise.all([
    Note.find({ project: project._id }).sort({ updatedAt: -1 }).limit(10),
    File.find({ project: project._id }).limit(20),
  ]);

  const notesText = notes.map((n) => `- ${n.title}: ${n.content.slice(0, 400)}`).join("\n") || "(none)";
  const filesText = files.map((f) => `- ${f.originalName}`).join("\n") || "(none)";

  const prompt =
    `Generate a professional README.md for this project.\n\n` +
    `Project name: ${project.name}\nDescription: ${project.description || "(none)"}\n\n` +
    `Notes:\n${notesText}\n\nFiles:\n${filesText}\n\n` +
    `Extra details from the user:\n${content || "(none)"}\n\n` +
    `The README must contain: Project title, Description, Features, Technology stack, Installation instructions, ` +
    `Environment variables, Usage instructions, API documentation, and Future improvements. ` +
    `If something is unknown, write a sensible placeholder clearly marked as "TODO" instead of guessing.`;

  const result = await askGemini({
    systemInstruction: `You are a senior open-source maintainer writing READMEs. ${RULES}`,
    prompt,
  });

  let saved = false;
  if (save && isOwner) {
    project.readme = result;
    await project.save();
    saved = true;
  }
  await logActivity(project._id, req.user._id, "ai_used", "README generated");

  res.json({ success: true, message: "README generated", data: { result, saved } });
});