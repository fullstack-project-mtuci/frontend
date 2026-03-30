import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "./ui/input";

export function Topbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search trips, expenses..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#2563EB] rounded-full"></span>
        </button>

        {/* User menu */}
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">JD</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
