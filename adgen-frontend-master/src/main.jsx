import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Create demo user on first load
const initDemoUser = () => {
  const users = JSON.parse(localStorage.getItem('adgen_users') || '[]');
  if (!users.find(u => u.email === 'demo@adgen.ai')) {
    users.push({
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@adgen.ai',
      password: 'demo123',
      avatar: null,
      createdAt: new Date().toISOString(),
      projects: 5,
      exports: 12
    });
    localStorage.setItem('adgen_users', JSON.stringify(users));
  }
};

initDemoUser();

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
