"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileAudio,
  Upload,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  Loader2,
  Plus,
  ArrowRight,
  Music,
  Brain,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserToken } from "@/lib/auth";

const stats = [
  {
    name: "Total Files",
    value: "0",
    change: "+0%",
    changeType: "neutral",
    icon: FileAudio,
    color: "slate",
  },
  {
    name: "Completed",
    value: "0",
    change: "+0%",
    changeType: "neutral",
    icon: CheckCircle,
    color: "green",
  },
  {
    name: "Processing",
    value: "0",
    change: "+0%",
    changeType: "neutral",
    icon: Loader2,
    color: "blue",
  },
  {
    name: "Content Generated",
    value: "0",
    change: "+0%",
    changeType: "neutral",
    icon: Zap,
    color: "emerald",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "upload",
    title: "lecture-notes.mp3",
    time: "2 hours ago",
    status: "completed",
    size: "15.2 MB",
  },
  {
    id: 2,
    type: "processing",
    title: "meeting-recording.wav",
    time: "4 hours ago",
    status: "processing",
    size: "28.5 MB",
  },
  {
    id: 3,
    type: "content",
    title: "podcast-episode-12.mp3",
    time: "1 day ago",
    status: "completed",
    size: "45.1 MB",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { setTitle } = usePageTitle();
  const router = useRouter();

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between h-16">
            {/* Left - Welcome */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome back, {user?.email?.split("@")[0]}!
              </h1>
              <p className="text-sm text-gray-500">
                Here's your audio library overview
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">
                  Total Files
                </div>
                <div className="text-2xl font-bold text-slate-900">0</div>
                <div className="text-xs text-slate-500 mt-1">All uploads</div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileAudio className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600">
                  Completed
                </div>
                <div className="text-2xl font-bold text-blue-900">0</div>
                <div className="text-xs text-blue-500 mt-1">Ready to view</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-orange-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-orange-600">
                  Processing
                </div>
                <div className="text-2xl font-bold text-orange-900">0</div>
                <div className="text-xs text-orange-500 mt-1">In progress</div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-emerald-600">
                  Content Generated
                </div>
                <div className="text-2xl font-bold text-emerald-900">0</div>
                <div className="text-xs text-emerald-500 mt-1">
                  Learning materials
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/flow/upload")}
                className="w-full p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-100 transition-all group text-left h-auto justify-start"
                variant="ghost"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-gray-900">
                      Upload Audio File
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Start generating learning content from your audio
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </Button>

              <Button
                onClick={() => router.push("/library")}
                className="w-full p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-100 transition-all group text-left h-auto justify-start"
                variant="ghost"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-gray-900">
                      Browse Library
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage and view your uploaded audio files
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </Button>

              <Button
                onClick={() => router.push("/flow/generate")}
                className="w-full p-6 bg-purple-50 border-2 border-purple-200 rounded-xl hover:border-purple-300 hover:bg-purple-100 transition-all group text-left h-auto justify-start"
                variant="ghost"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-gray-900">
                      Generate Content
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Create learning materials with AI
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </Button>
            </div>
          </div>

          {/* Learning Content Types */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                What You Can Generate
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Summary & Key Points
                  </h3>
                  <p className="text-xs text-gray-600">
                    Automatic content summarization
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Study Cards
                  </h3>
                  <p className="text-xs text-gray-600">
                    Interactive flashcards for learning
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Key Concepts
                  </h3>
                  <p className="text-xs text-gray-600">
                    Important topics and definitions
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Upload your first audio file to start generating learning
                    content
                  </p>
                  <Button
                    onClick={() => router.push("/flow/upload")}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
