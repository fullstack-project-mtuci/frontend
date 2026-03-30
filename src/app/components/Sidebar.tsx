import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Plane,
  Receipt,
  Wallet,
  FileText,
  User,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Trips", href: "/trips", icon: Plane },
  { name: "Expenses", href: "/trips/1/expenses", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Approvals", href: "/approvals", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const location = useLocation();

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
        {navigation.map((item) => {
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
          <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F172A] truncate">
              John Doe
            </p>
            <p className="text-xs text-gray-500 truncate">Employee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
