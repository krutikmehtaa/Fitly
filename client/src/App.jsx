import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isLoggedIn, isRegistered, loading } = useAuth();

  console.log({ isLoggedIn, isRegistered, loading });

  if (loading) return <div>Loading Auth...</div>;

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/register"
          element={isLoggedIn ? <Home /> : <Navigate to="/" replace />}
        />
        <Route
          path="/planner"
          element={isLoggedIn && isRegistered ? <Planner /> : <Navigate to="/" replace />}
        />
        <Route
          path="/dashboard"
          element={isLoggedIn && isRegistered ? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
