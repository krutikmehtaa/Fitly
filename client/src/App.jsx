import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Dashboard from "./pages/Dashboard";
import EditFamily from "./pages/EditFamily";
import Wellness from "./pages/Wellness";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

// Loading component with animated logo
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated logo */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow"
        >
          <span className="text-2xl font-bold text-white">F</span>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/60 font-medium"
        >
          Loading Fitly...
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { isLoggedIn, isRegistered, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {isLoggedIn && <Navbar />}
        </AnimatePresence>
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              isLoggedIn 
                ? (isRegistered ? <Navigate to="/planner" replace /> : <Navigate to="/register" replace />)
                : <AuthPage />
            } />
            <Route
              path="/register"
              element={
                isLoggedIn 
                  ? (isRegistered ? <Navigate to="/planner" replace /> : <Home />)
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/planner"
              element={isLoggedIn && isRegistered ? <Planner /> : <Navigate to="/" replace />}
            />
            <Route
              path="/dashboard"
              element={isLoggedIn && isRegistered ? <Dashboard /> : <Navigate to="/" replace />}
            />
            <Route
              path="/family"
              element={isLoggedIn && isRegistered ? <EditFamily /> : <Navigate to="/" replace />}
            />
            <Route
              path="/wellness"
              element={isLoggedIn && isRegistered ? <Wellness /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
