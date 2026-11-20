
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Loader from "./components/Loader.jsx";

// Public pages
const Landing = lazy(() => import("./pages/Landing.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const PublicProject = lazy(() => import("./pages/PublicProject.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Protected pages
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));
const CreateProject = lazy(() => import("./pages/CreateProject.jsx"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails.jsx"));
const ProjectMembers = lazy(() => import("./pages/ProjectMembers.jsx"));
const ProjectNotes = lazy(() => import("./pages/ProjectNotes.jsx"));
const MarkdownEditor = lazy(() => import("./pages/MarkdownEditor.jsx"));
const ProjectFiles = lazy(() => import("./pages/ProjectFiles.jsx"));
const CodePreview = lazy(() => import("./pages/CodePreview.jsx"));
const GeminiAssistant = lazy(() => import("./pages/GeminiAssistant.jsx"));
const ProjectAnalytics = lazy(() => import("./pages/ProjectAnalytics.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const RecentActivity = lazy(() => import("./pages/RecentActivity.jsx"));

const App = () => {
  return (
    <Suspense fallback={<Loader text="Loading page..." />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/share/:shareToken"
          element={<PublicProject />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/projects" element={<Projects />} />

            <Route path="/projects/new" element={<CreateProject />} />

            <Route path="/profile" element={<Profile />} />

            {/* Recent Activity */}
            <Route
              path="/recent-activity"
              element={<RecentActivity />}
            />

            <Route
              path="/projects/:projectId"
              element={<ProjectDetails />}
            />

            <Route
              path="/projects/:projectId/members"
              element={<ProjectMembers />}
            />

            <Route
              path="/projects/:projectId/notes"
              element={<ProjectNotes />}
            />

            <Route
              path="/projects/:projectId/notes/new"
              element={<MarkdownEditor />}
            />

            <Route
              path="/projects/:projectId/notes/:noteId/edit"
              element={<MarkdownEditor />}
            />

            <Route
              path="/projects/:projectId/files"
              element={<ProjectFiles />}
            />

            <Route
              path="/projects/:projectId/code/:fileId"
              element={<CodePreview />}
            />

            <Route
              path="/projects/:projectId/ai"
              element={<GeminiAssistant />}
            />

            <Route
              path="/projects/:projectId/analytics"
              element={<ProjectAnalytics />}
            />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
