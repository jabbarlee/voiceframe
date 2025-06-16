"use client";

import { useState } from "react";
import {
  Download,
  Share2,
  Copy,
  Settings,
  Send,
  ChevronDown,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Sparkles,
  Clock,
  Users,
  BarChart3,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentHeaderProps {
  title: string;
  industry: string;
  contentType: string;
  stats?: {
    readTime?: string;
    wordCount?: number;
    engagement?: string;
  };
}

export function ContentHeader({
  title,
  industry,
  contentType,
  stats,
}: ContentHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);

  const exportOptions = [
    { id: "docx", label: "Microsoft Word", icon: FileText },
    { id: "pdf", label: "PDF Document", icon: FileText },
    { id: "html", label: "HTML File", icon: Globe },
    { id: "markdown", label: "Markdown", icon: FileText },
    { id: "txt", label: "Plain Text", icon: FileText },
  ];

  const shareOptions = [
    { id: "link", label: "Copy Link", icon: Copy },
    { id: "email", label: "Email", icon: Mail },
    { id: "slack", label: "Slack", icon: MessageSquare },
    { id: "teams", label: "Microsoft Teams", icon: MessageSquare },
  ];

  const scheduleOptions = [
    { id: "now", label: "Publish Now", time: "Immediate" },
    { id: "optimal", label: "Optimal Time", time: "Today 2:00 PM" },
    { id: "custom", label: "Custom Schedule", time: "Choose date & time" },
  ];

  return (
    <div className="bg-gradient-to-r from-white via-emerald-50/20 to-white border-b border-gray-200">
      {/* Main Header */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Content Info with Visual Elements */}
          <div className="flex items-center space-x-6">
            {/* Content Icon & Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {title}
                </h1>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {industry}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{contentType}</span>
                  <span className="text-gray-500">•</span>
                  <span className="flex items-center text-green-600">
                    <Zap className="h-3 w-3 mr-1" />
                    AI Generated
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="hidden lg:flex items-center space-x-4">
                {stats.readTime && (
                  <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-xs text-gray-500">Read Time</div>
                        <div className="font-semibold text-gray-900">
                          {stats.readTime}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {stats.wordCount && (
                </div>
              </div>
            )}
          </div>

          {/* Export Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setShowExportMenu(false)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Schedule/Publish Menu */}
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setShowScheduleMenu(!showScheduleMenu)}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Publish</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showScheduleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {scheduleOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setShowScheduleMenu(false)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600">{option.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
