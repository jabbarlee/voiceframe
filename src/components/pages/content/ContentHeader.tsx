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
  MoreHorizontal,
  CheckCircle,
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);

  const moreOptions = [
    { id: "copy", label: "Copy Content", icon: Copy },
    { id: "share", label: "Share Link", icon: Share2 },
    { id: "export-docx", label: "Export as Word", icon: FileText },
    { id: "export-pdf", label: "Export as PDF", icon: FileText },
    { id: "export-html", label: "Export as HTML", icon: Globe },
    { id: "settings", label: "Content Settings", icon: Settings },
  ];

  const publishOptions = [
    {
      id: "now",
      label: "Publish Now",
      description: "Share immediately",
      icon: Zap,
    },
    {
      id: "schedule",
      label: "Schedule Post",
      description: "Choose optimal time",
      icon: Clock,
    },
    {
      id: "draft",
      label: "Save as Draft",
      description: "Keep for later",
      icon: FileText,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200/60">
      {/* Main Header Section */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Content Info */}
          <div className="flex items-center space-x-6">
            {/* Content Icon & Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white shadow-sm">
                  <CheckCircle className="h-2 w-2 text-white ml-0.5 mt-0.5" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                  {title}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {industry}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 font-medium">
                    {contentType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* More Actions Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="h-10 px-4 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2">
                    {moreOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setShowMoreMenu(false)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-xl transition-colors flex items-center space-x-3"
                        >
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Publish Button */}
            <div className="relative">
              <Button
                size="lg"
                onClick={() => setShowPublishMenu(!showPublishMenu)}
                className="h-12 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl font-semibold"
              >
                <Send className="h-4 w-4 mr-2" />
                <span>Publish</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {showPublishMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3">
                    {publishOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setShowPublishMenu(false)}
                          className="w-full p-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {option.label}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Status Bar */}
      <div className="px-8 pb-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Stats Cards */}
          <div className="flex items-center space-x-4">
            {stats?.readTime && (
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div className="text-sm">
                    <span className="text-gray-500">Read:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {stats.readTime}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {stats?.wordCount && (
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <div className="text-sm">
                    <span className="text-gray-500">Words:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {stats.wordCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {stats?.engagement && (
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <div className="text-sm">
                    <span className="text-gray-500">Score:</span>
                    <span className="font-semibold text-gray-900 ml-1">
                      {stats.engagement}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Status */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                Ready to publish
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Updated 2 min ago</span>
            <span className="text-gray-400">•</span>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">Optimized for your audience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
