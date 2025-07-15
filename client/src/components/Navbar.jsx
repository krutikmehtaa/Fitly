import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const { user, isRegistered } = useAuth();

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="font-bold text-xl">FitBuddy</div>
      <div className="flex space-x-6 text-base">
        {!isRegistered && (
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive
                ? "text-yellow-400 font-semibold"
                : "hover:text-yellow-300"
            }
          >
            Register
          </NavLink>
        )}
        {isRegistered && (
          <>
            <NavLink
              to="/planner"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-400 font-semibold"
                  : "hover:text-yellow-300"
              }
            >
              Planner
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-400 font-semibold"
                  : "hover:text-yellow-300"
              }
            >
              Dashboard
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}