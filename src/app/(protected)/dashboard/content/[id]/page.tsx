"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  Sparkles,
  ChevronDown,
  Twitter,
  FileText,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TwitterThreads,
  TwitterThreadsRef,
} from "@/components/pages/content/TwitterThreads";

interface ContentItem {
  id: number;
  content: string;
  type?: string;
}

interface ContentType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ContentItem[];
}

export default function ContentGenerationPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const audioId = params.id as string;

  const [activeTab, setActiveTab] = useState("twitter");
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const twitterThreadsRef = useRef<TwitterThreadsRef>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Content types with Twitter Threads
  const contentTypes: ContentType[] = [
    {
      id: "twitter",
      title: "Twitter Threads",
      description:
        "Create engaging Twitter thread content with interactive editing",
      icon: Twitter,
      items: [
        {
          id: 1,
          content: `Why voice technology is the next big business disruptor 🧵

We're witnessing a fundamental shift in how businesses handle information. Voice technology isn't just a trend—it's becoming essential infrastructure.

The numbers speak for themselves:
• 70% productivity increase
• 80% reduction in transcription costs  
• 50% faster content creation
• Universal accessibility benefits

Traditional workflows looked like this:
Record → Manual transcription → Edit → Create content → Publish

New voice-first workflow:
Speak → Instant transcription → AI content generation → Multi-format output

The real game-changer? Voice removes the friction between ideas and execution. No more "I'll write that down later" moments that never happen.

Accessibility wins: Voice technology opens doors for:
• Non-native speakers
• Users with motor disabilities  
• People who think better out loud
• Anyone who prefers speaking to typing

Cost impact is massive. Companies spending $1000s on transcription services can now get better results for a fraction of the cost.

The future belongs to businesses that can move from idea to content at the speed of speech. Are you ready to make the leap? 🚀`,
        },
        {
          id: 2,
          content: `🎙️ Voice technology isn't replacing writers—it's amplifying human creativity. Speak your ideas, let AI handle the formatting. Focus on what matters: your unique perspective and insights.

The best content creators of 2024 will be those who master voice-to-content workflows. Why type when you can speak and get better results faster?

Just spent 5 minutes speaking and got a full blog post, social media content, and key talking points. The future of content creation is here and it's incredible 🤯`,
        },
      ],
    },
  ];

  useEffect(() => {
    setTitle("Content Generation");
  }, [setTitle]);

  useEffect(() => {
    setCurrentItemIndex(0);
  }, [activeTab]);

  const handleCopyContent = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(type);
      setTimeout(() => setCopiedContent(null), 2000);
    } catch (error) {
      console.error("Failed to copy content:", error);
    }
  };

  const handleDownloadContent = (content: string, type: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-content-${audioId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Twitter-specific export functions
  const handleTwitterCopyAsText = async () => {
    try {
      await twitterThreadsRef.current?.copyAsText();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleTwitterExportAsText = () => {
    twitterThreadsRef.current?.exportAsText();
    setShowDownloadMenu(false);
  };

  const handleTwitterExportAsCSV = () => {
    twitterThreadsRef.current?.exportAsCSV();
    setShowDownloadMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadMenu) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDownloadMenu]);

  // Show loading while waiting for auth state
  if (user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Authenticating...</span>
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

  const activeContent = contentTypes.find((type) => type.id === activeTab);
  const currentItem = activeContent?.items[currentItemIndex];
  const hasMultipleItems = (activeContent?.items.length || 0) > 1;

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
                Transform your transcript into engaging content
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-800 font-medium text-sm">
                  Content ready to view!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 min-h-0 overflow-hidden">
        {/* Left Side - Content Type Selector */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Content Types
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Select a format to view generated content
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = activeTab === type.id;

                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveTab(type.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-50 border-2 border-emerald-200 shadow-sm"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
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
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              isActive ? "text-emerald-900" : "text-gray-900"
                            }`}
                          >
                            {type.title}
                          </h4>
                          <p
                            className={`text-sm mt-1 ${
                              isActive ? "text-emerald-600" : "text-gray-500"
                            }`}
                          >
                            {type.description}
                          </p>
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
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
            {activeContent ? (
              <>
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <activeContent.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {activeContent.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Generated from your audio transcript
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          currentItem &&
                          handleCopyContent(
                            currentItem.content,
                            activeContent?.id || ""
                          )
                        }
                        className="flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>
                          {copiedContent === activeContent?.id
                            ? "Copied!"
                            : "Copy"}
                        </span>
                      </Button>

                      {/* Download Button with Dropdown */}
                      <div className="relative">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (activeTab === "twitter") {
                              setShowDownloadMenu(!showDownloadMenu);
                            } else {
                              currentItem &&
                                handleDownloadContent(
                                  currentItem.content,
                                  activeContent?.title || ""
                                );
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                          {activeTab === "twitter" && (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Twitter Download Dropdown */}
                        {activeTab === "twitter" && showDownloadMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="py-2">
                              <button
                                onClick={handleTwitterCopyAsText}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <FileText className="h-4 w-4" />
                                <span>
                                  {copySuccess ? "Copied!" : "Copy as Text"}
                                </span>
                              </button>
                              <button
                                onClick={handleTwitterExportAsText}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download as Text</span>
                              </button>
                              <button
                                onClick={handleTwitterExportAsCSV}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Table className="h-4 w-4" />
                                <span>Download as CSV</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {currentItem && (
                    <div className="h-full">
                      {activeTab === "twitter" && (
                        <TwitterThreads
                          ref={twitterThreadsRef}
                          initialContent={currentItem.content}
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">✨</div>
                  <p className="text-gray-500">
                    Select a content type to view generated content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
