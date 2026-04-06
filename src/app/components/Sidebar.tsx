import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Plane,
  Wallet,
  FileText,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "../providers/AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["employee", "manager", "accountant", "admin"] },
  { name: "Trips", href: "/trips", icon: Plane, roles: ["employee", "manager", "accountant", "admin"] },
  { name: "Approvals", href: "/approvals", icon: FileText, roles: ["manager", "accountant", "admin"] },
  { name: "Budgets", href: "/budgets", icon: Wallet, roles: ["manager", "accountant", "admin"] },
  { name: "Admin", href: "/admin", icon: ShieldCheck, roles: ["admin"] },
  { name: "Profile", href: "/profile", icon: User, roles: ["employee", "manager", "accountant", "admin"] },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const visibleItems = useMemo(() => {
    if (!user) return [];
    return navigation.filter((item) => item.roles.includes(user.role));
  }, [user]);

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-[#0F172A]">TripManager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-sm font-semibold uppercase">
            {initials || "ME"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F172A] truncate">
              {user?.fullName || "Loading..."}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-[#2563EB] rounded-lg hover:bg-gray-50"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
