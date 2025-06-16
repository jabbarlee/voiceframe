"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useEffect } from "react";
import {
  BarChart3,
  FileText,
  Mic,
  TrendingUp,
  Clock,
  Users,
  Star,
  Plus,
} from "lucide-react";

const stats = [
  {
    name: "Total Transcriptions",
    value: "24",
    change: "+12%",
    changeType: "increase",
    icon: FileText,
  },
  {
    name: "Audio Files",
    value: "18",
    change: "+5%",
    changeType: "increase",
    icon: Mic,
  },
  {
    name: "Processing Time",
    value: "2.4h",
    change: "-8%",
    changeType: "decrease",
    icon: Clock,
  },
  {
    name: "Team Members",
    value: "3",
    change: "0%",
    changeType: "neutral",
    icon: Users,
  },
];

const recentActivity = [
  {
    id: 1,
    type: "transcription",
    title: "Meeting Notes - Product Review",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    type: "upload",
    title: "Interview Audio.mp3",
    time: "4 hours ago",
    status: "processing",
  },
  {
    id: 3,
    type: "transcription",
    title: "Podcast Episode 12",
    time: "1 day ago",
    status: "completed",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your voice projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <stat.icon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp
                className={`h-4 w-4 mr-1 ${
                  stat.changeType === "increase"
                    ? "text-green-500"
                    : stat.changeType === "decrease"
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "increase"
                    ? "text-green-600"
                    : stat.changeType === "decrease"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  {activity.type === "transcription" ? (
                    <FileText className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Mic className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h2>

          <div className="space-y-4">
            <button className="w-full p-4 border-2 border-dashed border-emerald-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                  <Plus className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  Upload Audio
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Start a new transcription project
                </p>
              </div>
            </button>

            <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-emerald-200 hover:bg-emerald-50 transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-900">
                    View Analytics
                  </h3>
                  <p className="text-xs text-gray-500">
                    Detailed usage statistics
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-emerald-200 hover:bg-emerald-50 transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Star className="h-5 w-5 text-gray-600 group-hover:text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-900">
                    Upgrade Plan
                  </h3>
                  <p className="text-xs text-gray-500">Get more features</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
