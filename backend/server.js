
import env from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import "./models/index.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CollabSphere API is running",
    data: {
      time: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public", publicRoutes);

app.use(notFound);
app.use(errorHandler);

// Prevent multiple MongoDB connection attempts
let dbConnection;

const connectDatabase = async () => {
  if (!dbConnection) {
    dbConnection = connectDB();
  }

  await dbConnection;
};

// Vercel serverless handler
const handler = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Server startup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};

// Local development
if (env.nodeEnv === "development") {
  connectDatabase()
    .then(() => {
      app.listen(env.port, () => {
        console.log(
          `Server running on http://localhost:${env.port} (${env.nodeEnv})`
        );
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exitCode = 1;
    });
}

export default handler;
