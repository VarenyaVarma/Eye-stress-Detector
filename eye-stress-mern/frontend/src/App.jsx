import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import UploadPage from "./components/UploadPage";
import History from "./components/History";
import Result from "./components/Result";

function useAuth() {
  const [auth, setAuth] = useState({
    loggedIn: !!localStorage.getItem("token"),
    token: localStorage.getItem("token"),
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setAuth({
        loggedIn: !!localStorage.getItem("token"),
        token: localStorage.getItem("token"),
      });
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    ...auth,
    refresh: () =>
      setAuth({
        loggedIn: !!localStorage.getItem("token"),
        token: localStorage.getItem("token"),
      }),
  };
}

function Protected({ children }) {
  const auth = useAuth();
  if (!auth.loggedIn) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const auth = useAuth();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, [auth.loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
    auth.refresh();
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6 relative">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Eye Stress Detector
          </h1>
          <p className="text-sm text-slate-400">
            AI-powered insights to protect and monitor your eye health.
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex items-center space-x-3">
          <Link
            to="/"
            className="px-3 py-2 rounded-md glass hover:bg-slate-700 transition"
          >
            Home
          </Link>

          {!auth.loggedIn && (
            <>
              <Link
                to="/login"
                className="px-3 py-2 rounded-md glass hover:bg-slate-700 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-2 rounded-md bg-teal-500 hover:opacity-90 transition"
              >
                Signup
              </Link>
            </>
          )}

          {auth.loggedIn && (
            <>
              <Link
                to="/upload"
                className="px-3 py-2 rounded-md bg-teal-500 hover:opacity-90 transition"
              >
                Upload
              </Link>
              <Link
                to="/history"
                className="px-3 py-2 rounded-md glass hover:bg-slate-700 transition"
              >
                History
              </Link>

              {/* 👤 Profile Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center hover:bg-cyan-300 transition"
                  title={user?.name || "Profile"}
                >
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b border-slate-700 text-center">
                      <p className="text-sm font-medium text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user?.email || ""}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-b-lg transition"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="bg-gradient-to-b from-slate-800/60 to-slate-900/40 p-6 rounded-xl shadow-xl glass">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/upload"
            element={
              <Protected>
                <UploadPage />
              </Protected>
            }
          />
          <Route
            path="/history"
            element={
              <Protected>
                <History />
              </Protected>
            }
          />
          <Route
            path="/result/:id"
            element={
              <Protected>
                <Result />
              </Protected>
            }
          />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="mt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} - Eye Stress Detector
      </footer>
    </div>
  );
}
