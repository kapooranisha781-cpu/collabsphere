import env from "./config/env.js"; // sabse pehle
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js"; // models se pehle (toJSON setting ke liye)
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

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CollabSphere API is running",
    data: { time: new Date().toISOString() },
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

const startServer = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
};

startServer();




// import env from "./config/env.js"; // must be first: loads and validates .env
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import connectDB from "./config/db.js";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// const app = express();

// // ---------- Global middleware ----------
// app.use(
//   helmet({
//     // Needed later so the frontend can display uploaded images from this server
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );
// app.use(
//   cors({
//     origin: env.clientUrl,
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ extended: true }));

// if (env.nodeEnv === "development") {
//   app.use(morgan("dev"));
// }

// // ---------- Routes ----------
// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "CollabSphere API is running",
//     data: { time: new Date().toISOString() },
//   });
// });

// // Feature routes will be added here in later phases

// // ---------- Error handling (must be LAST) ----------
// app.use(notFound);
// app.use(errorHandler);

// // ---------- Start ----------
// const startServer = async () => {
//   await connectDB();
//   app.listen(env.port, () => {
//     console.log(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
//   });
// };

// startServer();






// import env from "./config/env.js"; // must be first: loads and validates .env
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import connectDB from "./config/db.js";
// import "./models/index.js"; // registers all models and their indexes
// import authRoutes from "./routes/authRoutes.js";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// const app = express();

// // ---------- Global middleware ----------
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );
// app.use(
//   cors({
//     origin: env.clientUrl,
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ extended: true }));

// if (env.nodeEnv === "development") {
//   app.use(morgan("dev"));
// }

// // ---------- Routes ----------
// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "CollabSphere API is running",
//     data: { time: new Date().toISOString() },
//   });
// });

// app.use("/api/auth", authRoutes);

// // Feature routes will be added here in later phases

// // ---------- Error handling (must be LAST) ----------
// app.use(notFound);
// app.use(errorHandler);

// // ---------- Start ----------
// const startServer = async () => {
//   await connectDB();
//   app.listen(env.port, () => {
//     console.log(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
//   });
// };

// startServer();