"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Upload,
  FileText,
  Library,
  User,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    name: "Upload Audio",
    href: "/flow/upload",
    icon: Upload,
    description: "Upload new audio files",
  },
  {
    name: "Library",
    href: "/library",
    icon: Library,
    description: "Manage your audio files",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account & preferences",
  },
  {
    name: "Pricing & Plans",
    href: "/pricing",
    icon: Zap,
    description: "Upgrade your plan",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo - Match content page headers exactly */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2 h-16">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
            VoiceFrame
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-400 group-hover:text-emerald-500"
                }`}
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <ChevronRight className="h-4 w-4 text-emerald-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500">
              {user?.emailVerified ? "Verified" : "Unverified"}
            </p>
          </div>
        </div>

        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
