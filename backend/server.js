
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

import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// CORS
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Development logging
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// MongoDB connection cache
let dbConnection;

const connectDatabase = async () => {
  if (!dbConnection) {
    dbConnection = connectDB().catch((error) => {
      dbConnection = null;
      throw error;
    });
  }

  return dbConnection;
};

// Connect database before API requests
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CollabSphere API is running",
    data: {
      time: new Date().toISOString(),
    },
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public", publicRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export Express app for Vercel
export default app;

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
    });
}
