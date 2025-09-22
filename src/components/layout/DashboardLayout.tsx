import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Home,
  User,
  Trophy,
  Newspaper,
  Award,
  LogOut,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardLayoutProps {
  type: "player" | "admin";
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ type }) => {
  const location = useLocation();
  const { profile, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const playerNavItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/dashboard/profile", icon: User, label: "My Profile" },
    { path: "/dashboard/tournaments", icon: Trophy, label: "My Tournaments" },
    { path: "/dashboard/results", icon: Award, label: "My Results" },
    { path: "/dashboard/news", icon: Newspaper, label: "News" },
  ];

  const adminNavItems = [
    { path: "/admin", icon: Home, label: "Dashboard" },
    { path: "/admin/news", icon: Newspaper, label: "News Management" },
    { path: "/admin/tournaments", icon: Trophy, label: "Tournament Management" },
    { path: "/admin/players", icon: Users, label: "Player Management" },
    { path: "/admin/results", icon: BarChart3, label: "Results Management" },
  ];

  const navItems = type === "admin" ? adminNavItems : playerNavItems;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show spinner if auth/profile is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-xl transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-lg font-bold">
              {type === "admin" ? "Admin Panel" : "Dashboard"}
            </h2>
            <p className="text-sm opacity-80">Welcome, {profile?.username || "User"}</p>
          </div>
          <button
            className="md:hidden p-1 rounded-md hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-white text-blue-700 shadow-md font-semibold"
                    : "hover:bg-white/10"
                }`}
                onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after click
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}

          <div className="mt-8 border-t border-white/20 pt-6">
            <Link
              to="/"
              className="flex items-center px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              Back to Website
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {type === "admin" ? "Admin Panel" : "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {profile?.role === "admin" ? "Admin" : "Player"}
            </span>
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
