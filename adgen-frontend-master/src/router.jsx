import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import PromptChat from "./pages/PromptChat";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrandGuidelines from "./pages/BrandGuidelines";
import UsageBilling from "./pages/UsageBilling";
import Imagine from "./pages/Imagine";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: "/create",
    element: (
      <ProtectedRoute>
        <PromptChat />
      </ProtectedRoute>
    )
  },
  {
    path: "/editor",
    element: (
      <ProtectedRoute>
        <Editor />
      </ProtectedRoute>
    )
  },
  {
    path: "/brand-guidelines",
    element: (
      <ProtectedRoute>
        <BrandGuidelines />
      </ProtectedRoute>
    )
  },
  {
    path: "/usage",
    element: (
      <ProtectedRoute>
        <UsageBilling />
      </ProtectedRoute>
    )
  },
  {
    path: "/imagine",
    element: (
      <ProtectedRoute>
        <Imagine />
      </ProtectedRoute>
    )
  },
]);
