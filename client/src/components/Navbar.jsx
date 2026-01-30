import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { LogoCompact } from "./Logo";

export default function Navbar() {
  const { currentUser, isRegistered, setIsLoggedIn, setIsRegistered } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setIsRegistered(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive
        ? "text-primary-400 bg-primary-500/10"
        : "text-white/70 hover:text-white hover:bg-white/5"
    }`;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to={isRegistered ? "/planner" : "/register"} className="group">
            <LogoCompact />
          </NavLink>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {!isRegistered && (
              <NavLink to="/register" className={navLinkClass}>
                Setup
              </NavLink>
            )}
            
            {isRegistered && (
              <>
                <NavLink to="/planner" className={navLinkClass}>
                  Planner
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/wellness" className={navLinkClass}>
                  🧠 Wellness
                </NavLink>
                <NavLink to="/family" className={navLinkClass}>
                  Manage Family
                </NavLink>
              </>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 mx-2" />

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
                {(currentUser.displayName || currentUser.email || "U")[0].toUpperCase()}
              </div>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
