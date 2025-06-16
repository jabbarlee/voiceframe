"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Megaphone,
  FileText,
  Mail,
  Building,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentHeader } from "@/components/pages/content/ContentHeader";
import { MarketingSocialMedia } from "@/components/pages/content/industries/MarketingSocialMedia";
import { BloggingJournalism } from "@/components/pages/content/industries/BloggingJournalism";

interface Industry {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  contentTypes: string[];
}

export default function ContentGenerationPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const audioId = params.id as string;

  const [selectedIndustry, setSelectedIndustry] = useState("marketing");

  const industries: Industry[] = [
    {
      id: "marketing",
      name: "Marketing & Social Media",
      description: "Social posts, ad copy, campaigns",
      icon: Megaphone,
      contentTypes: [
        "Twitter Threads",
        "Instagram Posts",
        "LinkedIn Content",
        "Facebook Posts",
      ],
    },
    {
      id: "blogging",
      name: "Blogging & Journalism",
      description: "Articles, blog posts, interviews",
      icon: FileText,
      contentTypes: [
        "Blog Posts",
        "News Articles",
        "Interviews",
        "Case Studies",
      ],
    },
    {
      id: "email",
      name: "Email Marketing",
      description: "Newsletters, campaigns, sequences",
      icon: Mail,
      contentTypes: ["Newsletters", "Email Campaigns", "Drip Sequences"],
    },
    {
      id: "corporate",
      name: "Corporate & Business",
      description: "Reports, summaries, documentation",
      icon: Building,
      contentTypes: ["Meeting Minutes", "Executive Summaries", "Reports"],
    },
    {
      id: "education",
      name: "Education & Research",
      description: "Notes, summaries, study guides",
      icon: GraduationCap,
      contentTypes: ["Lecture Notes", "Research Summaries", "Study Guides"],
    },
    {
      id: "media",
      name: "Media & Entertainment",
      description: "Show notes, scripts, captions",
      icon: PlayCircle,
      contentTypes: ["Show Notes", "Subtitles", "Scripts"],
    },
  ];

  useEffect(() => {
    setTitle("AI Content Generation");
  }, [setTitle]);

  // Show loading while waiting for auth state
  if (user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please sign in to access this page
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const selectedIndustryData = industries.find(
    (i) => i.id === selectedIndustry
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Transcript</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Content Generation
              </h1>
              <p className="text-gray-600">
                Transform your transcript into industry-specific content
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-800 font-medium text-sm">
                  Content Generated Successfully
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 min-h-0 overflow-hidden">
        {/* Left Sidebar - Industry Selector */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Industry & Content Types
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Select your industry to view optimized content formats
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {industries.map((industry) => {
                  const Icon = industry.icon;
                  const isActive = selectedIndustry === industry.id;

                  return (
                    <button
                      key={industry.id}
                      onClick={() => setSelectedIndustry(industry.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-50 border-2 border-emerald-200 shadow-sm"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isActive ? "bg-emerald-100" : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isActive ? "text-emerald-600" : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium ${
                              isActive ? "text-emerald-900" : "text-gray-900"
                            }`}
                          >
                            {industry.name}
                          </h4>
                          <p
                            className={`text-sm mt-1 ${
                              isActive ? "text-emerald-600" : "text-gray-500"
                            }`}
                          >
                            {industry.description}
                          </p>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {industry.contentTypes
                                .slice(0, 2)
                                .map((type, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      isActive
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {type}
                                  </span>
                                ))}
                              {industry.contentTypes.length > 2 && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    isActive
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  +{industry.contentTypes.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Content Display */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Content Header */}
          <ContentHeader
            title={selectedIndustryData?.name || "Content Generation"}
            industry={selectedIndustryData?.description || ""}
            contentType="Multi-format Content"
          />

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {selectedIndustry === "marketing" && <MarketingSocialMedia />}
            {selectedIndustry === "blogging" && <BloggingJournalism />}
            {selectedIndustry === "email" && (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email Marketing Content
                </h3>
                <p className="text-gray-600">
                  Coming soon - Newsletter and email campaign generation
                </p>
              </div>
            )}
            {selectedIndustry === "corporate" && (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Corporate Content
                </h3>
                <p className="text-gray-600">
                  Coming soon - Meeting minutes and business reports
                </p>
              </div>
            )}
            {selectedIndustry === "education" && (
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Educational Content
                </h3>
                <p className="text-gray-600">
                  Coming soon - Lecture notes and study materials
                </p>
              </div>
            )}
            {selectedIndustry === "media" && (
              <div className="text-center py-12">
                <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Media Content
                </h3>
                <p className="text-gray-600">
                  Coming soon - Show notes and media production tools
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
