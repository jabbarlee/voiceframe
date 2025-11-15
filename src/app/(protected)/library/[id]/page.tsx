"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileAudio,
  BookOpen,
  Brain,
  Target,
  GitBranch,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  Shuffle,
  CheckCircle,
  Sparkles,
  Clock,
  User,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Copy,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  RefreshCw,
  Award,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "reactflow/dist/style.css";
import { getCurrentUserToken } from "@/lib/auth";

// Add type definitions
type SummaryTone = "professional" | "friendly" | "eli5";
type StudyPackTemplate = "academic" | "modern" | "minimal" | "creative";

interface ContentData {
  audioTitle: string;
  duration: string;
  processedAt: string;
  summary: {
    professional: {
      title: string;
      sections: { heading: string; content: string }[];
    };
    friendly: {
      title: string;
      sections: { heading: string; content: string }[];
    };
    eli5: { title: string; sections: { heading: string; content: string }[] };
  };
  flashcards: { id: number; question: string; answer: string }[];
  concepts: { term: string; definition: string }[];
  studyPacks: {
    metadata: {
      title: string;
      subtitle: string;
      author: string;
      tags: string[];
      duration: string;
      level: string;
      generatedAt: string;
    };
    templates: {
      id: string;
      name: string;
      description: string;
      preview: string;
      color: string;
      features: string[];
    }[];
    stats: {
      totalPages: number;
      wordCount: number;
      readingTime: string;
      concepts: number;
      flashcards: number;
    };
  };
}

export default function ContentGenerationPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const audioId = params.id as string;

  const [activeTab, setActiveTab] = useState("summary");
  const [summaryTone, setSummaryTone] = useState<SummaryTone>("professional");
  const [showTldr, setShowTldr] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<StudyPackTemplate>("academic");

  // Data fetching state
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch content data from API
  useEffect(() => {
    let ignore = false;

    const fetchContentData = async () => {
      if (ignore) return;
      try {
        setIsLoading(true);

        if (!user) throw new Error("Authentication required");
        const idToken = await getCurrentUserToken();

        const response = await fetch(`/api/content/${audioId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        if (!result.success)
          throw new Error(result.error || "Failed to load content");

        setContentData(result.data);
        setTitle(result.data.audioTitle);

        console.log(`✅ Content loaded from ${result.source}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
        setContentData(null);
        setTitle("Content Not Available");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchContentData();

    return () => {
      ignore = true;
    };
  }, [audioId, setTitle, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  // Show error state - no data available
  if (error && !contentData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Ensure we have contentData before rendering
  if (!contentData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No content available</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  // Use only real API data
  const data = contentData;

  const contentTypes = [
    {
      id: "summary",
      icon: BookOpen,
      label: "Summary Notes",
      description: "Comprehensive notes in different tones",
      color: "emerald",
    },
    {
      id: "flashcards",
      icon: Brain,
      label: "Flashcards",
      description: "Interactive Q&A for memorization",
      color: "blue",
    },
    {
      id: "concepts",
      icon: Target,
      label: "Key Concepts",
      description: "Important terms and definitions",
      color: "purple",
    },
    {
      id: "studypack",
      icon: Award,
      label: "Study Pack",
      description: "Complete shareable study package",
      color: "indigo",
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Audio Info Header - Smaller height */}
          <div className="px-6 py-3 border-b border-gray-200 flex-shrink-0">
            {" "}
            <div className="flex items-center space-x-3 h-16">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileAudio className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-gray-900 truncate"
                  title={data.audioTitle}
                >
                  {data.audioTitle}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{data.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Type Navigation */}
          <div className="flex-1 p-6">
            <h5 className="font-medium text-gray-900 mb-4">Study Materials</h5>
            <nav className="space-y-2">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const isActive = activeTab === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveTab(type.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isActive
                        ? type.color === "emerald"
                          ? "bg-emerald-50 border-emerald-200 shadow-sm"
                          : type.color === "blue"
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : type.color === "purple"
                          ? "bg-purple-50 border-purple-200 shadow-sm"
                          : "bg-indigo-50 border-indigo-200 shadow-sm"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? type.color === "emerald"
                              ? "bg-emerald-100"
                              : type.color === "blue"
                              ? "bg-blue-100"
                              : type.color === "purple"
                              ? "bg-purple-100"
                              : "bg-indigo-100"
                            : "bg-gray-200"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive
                              ? type.color === "emerald"
                                ? "text-emerald-600"
                                : type.color === "blue"
                                ? "text-blue-600"
                                : type.color === "purple"
                                ? "text-purple-600"
                                : "text-indigo-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            isActive
                              ? type.color === "emerald"
                                ? "text-emerald-900"
                                : type.color === "blue"
                                ? "text-blue-900"
                                : type.color === "purple"
                                ? "text-purple-900"
                                : "text-indigo-900"
                              : "text-gray-900"
                          }`}
                        >
                          {type.label}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="flex-1 flex flex-col h-full">
              {/* Summary Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Summary Notes
                      </h2>
                      <p className="text-sm text-gray-500">
                        AI-generated comprehensive summary
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={showTldr ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTldr(!showTldr)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      TL;DR
                    </Button>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      {(["professional", "friendly", "eli5"] as const).map(
                        (tone) => (
                          <Button
                            key={tone}
                            variant={summaryTone === tone ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSummaryTone(tone)}
                            className={`h-8 ${
                              summaryTone === tone ? "bg-white shadow-sm" : ""
                            }`}
                          >
                            {tone === "professional" && (
                              <User className="h-4 w-4 mr-1" />
                            )}
                            {tone === "friendly" && (
                              <MessageSquare className="h-4 w-4 mr-1" />
                            )}
                            {tone === "eli5" && (
                              <Lightbulb className="h-4 w-4 mr-1" />
                            )}
                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {showTldr ? (
                  <div className="max-w-4xl mx-auto">
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        TL;DR - Quick Summary
                      </h3>
                      <p className="text-blue-800 leading-relaxed">
                        Machine Learning teaches computers to learn patterns
                        from data instead of following pre-written rules. There
                        are three main types: supervised (with labeled
                        examples), unsupervised (finding hidden patterns), and
                        reinforcement (learning from trial and error). Key
                        concepts include training data, algorithms, and model
                        validation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                      {/* Article Header */}
                      <div className="border-b border-gray-200 p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {data.summary[summaryTone].title}
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{data.duration}</span>
                          </span>
                          <span>•</span>
                          <span>Generated from audio transcription</span>
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="p-8">
                        <div className="prose prose-gray prose-lg max-w-none">
                          {data.summary[summaryTone].sections.map(
                            (section: any, index: number) => (
                              <div key={index} className="mb-8 last:mb-0">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-emerald-500 pl-4">
                                  {section.heading}
                                </h2>
                                <div
                                  className="text-gray-700 leading-relaxed space-y-3"
                                  dangerouslySetInnerHTML={{
                                    __html: section.content
                                      .replace(
                                        /\*\*(.*?)\*\*/g,
                                        '<strong class="font-semibold text-gray-900">$1</strong>'
                                      )
                                      .replace(
                                        /\*(.*?)\*/g,
                                        '<em class="italic text-gray-800">$1</em>'
                                      )
                                      .replace(
                                        /• (.*?)(?=\n|$)/g,
                                        '<li class="ml-4">$1</li>'
                                      )
                                      .replace(
                                        /(\d+\. .*?)(?=\n|$)/g,
                                        '<li class="ml-4 list-decimal">$1</li>'
                                      )
                                      .replace(
                                        /\n\n/g,
                                        '</p><p class="text-gray-700 leading-relaxed">'
                                      )
                                      .replace(/\n/g, "<br>")
                                      .replace(
                                        /^/,
                                        '<p class="text-gray-700 leading-relaxed">'
                                      )
                                      .replace(/$/, "</p>")
                                      .replace(
                                        /<li/g,
                                        '<ul class="list-disc space-y-1 my-3"><li'
                                      )
                                      .replace(/li>/g, "li></ul>")
                                      .replace(/<\/ul><ul[^>]*>/g, ""),
                                  }}
                                />
                              </div>
                            )
                          )}
                        </div>

                        {/* Summary Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>📚 Study Material</span>
                              <span>•</span>
                              <span>AI Generated</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-2"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy Summary</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === "flashcards" && (
            <div className="flex-1 flex flex-col h-full">
              {/* Flashcards Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Interactive Flashcards
                      </h2>
                      <p className="text-sm text-gray-500">
                        Master key concepts through spaced repetition
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Progress indicator */}
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {currentCardIndex + 1} of {data.flashcards.length}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Shuffle className="h-4 w-4" />
                      <span className="hidden sm:inline">Shuffle</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentCardIndex(0);
                        setShowAnswer(false);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline">Reset</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Flashcard Content */}
              <div className="flex-1 flex flex-col p-6 min-h-0 bg-gray-50">
                {/* Card Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(
                        ((currentCardIndex + 1) / data.flashcards.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentCardIndex + 1) / data.flashcards.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Main Card */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-4xl">
                    <div
                      className="relative bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px] cursor-pointer hover:shadow-md transition-all duration-300 group"
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {/* Card Type Badge */}
                      <div className="absolute -top-3 left-6 z-10">
                        <div
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border ${
                            showAnswer
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {showAnswer ? (
                            <>
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Answer
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Question
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-12 flex flex-col justify-center h-full">
                        <div className="text-center">
                          {/* Content */}
                          <div className="text-xl leading-relaxed text-gray-900 mb-8 whitespace-pre-wrap">
                            {showAnswer
                              ? data.flashcards[currentCardIndex].answer
                              : data.flashcards[currentCardIndex].question}
                          </div>

                          {/* Interaction Hint */}
                          <div className="flex items-center justify-center space-x-2 text-gray-400 group-hover:text-gray-600 transition-colors">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">
                              Click to{" "}
                              {showAnswer ? "show question" : "reveal answer"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2"
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      if (currentCardIndex > 0) {
                        setCurrentCardIndex(currentCardIndex - 1);
                        setShowAnswer(false);
                      }
                    }}
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Previous</span>
                  </Button>

                  {/* Center Action Button */}
                  <Button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                    size="lg"
                  >
                    {showAnswer ? (
                      <>
                        <EyeOff className="h-5 w-5 mr-2" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <Eye className="h-5 w-5 mr-2" />
                        Reveal Answer
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2"
                    disabled={currentCardIndex === data.flashcards.length - 1}
                    onClick={() => {
                      if (currentCardIndex < data.flashcards.length - 1) {
                        setCurrentCardIndex(currentCardIndex + 1);
                        setShowAnswer(false);
                      }
                    }}
                  >
                    <span>Next</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Study Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.flashcards.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Cards</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-emerald-600">
                      {currentCardIndex + 1}
                    </div>
                    <div className="text-sm text-gray-600">Current</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-gray-600">
                      {data.flashcards.length - currentCardIndex - 1}
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Concepts Tab */}
          {activeTab === "concepts" && (
            <div className="flex-1 flex flex-col h-full">
              {/* Concepts Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Key Concepts
                      </h2>
                      <p className="text-sm text-gray-500">
                        {data.concepts.length} essential terms and definitions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Concepts Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  {/* Concepts List */}
                  <div className="space-y-4">
                    {data.concepts.map((concept: any, index: number) => (
                      <div
                        key={index}
                        className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300"
                      >
                        {/* Concept Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-900 transition-colors leading-tight">
                              {concept.term}
                            </h3>
                          </div>
                        </div>

                        {/* Definition */}
                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed text-base">
                            {concept.definition}
                          </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Concept #{index + 1}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {data.concepts.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Concepts
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {
                          [
                            ...new Set(
                              data.concepts.map((c: any) => c.category)
                            ),
                          ].length
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Categories Covered
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Pack Tab */}
          {activeTab === "studypack" && (
            <div className="flex-1 flex flex-col h-full">
              {/* Study Pack Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Study Pack Generator
                      </h2>
                      <p className="text-sm text-gray-500">
                        Create beautiful, shareable study packages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Generate Pack</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Study Pack Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                  {/* Pack Overview */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {data.studyPacks.metadata.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {data.studyPacks.metadata.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {data.studyPacks.metadata.tags.map(
                            (tag: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="mt-4 lg:mt-0 lg:text-right">
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>Level: {data.studyPacks.metadata.level}</div>
                          <div>
                            Duration: {data.studyPacks.metadata.duration}
                          </div>
                          <div>
                            Reading: {data.studyPacks.stats.readingTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pack Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {data.studyPacks.stats.totalPages}
                        </div>
                        <div className="text-sm text-gray-600">Pages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.studyPacks.stats.wordCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Words</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {data.studyPacks.stats.concepts}
                        </div>
                        <div className="text-sm text-gray-600">Concepts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {data.studyPacks.stats.flashcards}
                        </div>
                        <div className="text-sm text-gray-600">Flashcards</div>
                      </div>
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Choose Your Template
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {data.studyPacks.templates.map((template: any) => (
                        <div
                          key={template.id}
                          className={`group relative bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                            selectedTemplate === template.id
                              ? template.color === "blue"
                                ? "border-blue-300 ring-2 ring-blue-100 shadow-lg"
                                : template.color === "purple"
                                ? "border-purple-300 ring-2 ring-purple-100 shadow-lg"
                                : template.color === "gray"
                                ? "border-gray-300 ring-2 ring-gray-100 shadow-lg"
                                : "border-emerald-300 ring-2 ring-emerald-100 shadow-lg"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                          }`}
                          onClick={() =>
                            setSelectedTemplate(
                              template.id as StudyPackTemplate
                            )
                          }
                        >
                          {/* Template Preview */}
                          <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative">
                            <div className="absolute inset-4 bg-white rounded shadow-sm">
                              <div className="p-3 space-y-2">
                                <div
                                  className={`h-2 rounded w-3/4 ${
                                    template.color === "blue"
                                      ? "bg-blue-200"
                                      : template.color === "purple"
                                      ? "bg-purple-200"
                                      : template.color === "gray"
                                      ? "bg-gray-200"
                                      : "bg-emerald-200"
                                  }`}
                                ></div>
                                <div className="h-1 bg-gray-200 rounded w-full"></div>
                                <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-1 bg-gray-200 rounded w-4/6"></div>
                                <div className="space-y-1 pt-2">
                                  <div className="h-1 bg-gray-100 rounded w-full"></div>
                                  <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                                  <div className="h-1 bg-gray-100 rounded w-3/4"></div>
                                </div>
                              </div>
                            </div>
                            {selectedTemplate === template.id && (
                              <div className="absolute top-2 right-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    template.color === "blue"
                                      ? "bg-blue-600"
                                      : template.color === "purple"
                                      ? "bg-purple-600"
                                      : template.color === "gray"
                                      ? "bg-gray-600"
                                      : "bg-emerald-600"
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Template Info */}
                          <div className="p-4">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {template.name}
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">
                              {template.description}
                            </p>
                            <div className="space-y-1">
                              {template.features.map(
                                (feature: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center text-xs text-gray-500"
                                  >
                                    <div
                                      className={`w-1 h-1 rounded-full mr-2 ${
                                        template.color === "blue"
                                          ? "bg-blue-400"
                                          : template.color === "purple"
                                          ? "bg-purple-400"
                                          : template.color === "gray"
                                          ? "bg-gray-400"
                                          : "bg-emerald-400"
                                      }`}
                                    ></div>
                                    {feature}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Template Preview
                          </h4>
                          <p className="text-sm text-gray-500">
                            {
                              data.studyPacks.templates.find(
                                (t: any) => t.id === selectedTemplate
                              )?.name
                            }{" "}
                            Style
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Full Preview
                          </Button>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Mock Preview */}
                    <div className="p-6">
                      <div className="max-w-2xl mx-auto">
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center ${
                            selectedTemplate === "academic"
                              ? "border-blue-300 bg-blue-50"
                              : selectedTemplate === "modern"
                              ? "border-purple-300 bg-purple-50"
                              : selectedTemplate === "minimal"
                              ? "border-gray-300 bg-gray-50"
                              : "border-emerald-300 bg-emerald-50"
                          }`}
                        >
                          <div
                            className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                              selectedTemplate === "academic"
                                ? "bg-blue-100"
                                : selectedTemplate === "modern"
                                ? "bg-purple-100"
                                : selectedTemplate === "minimal"
                                ? "bg-gray-100"
                                : "bg-emerald-100"
                            }`}
                          >
                            <FileText
                              className={`h-8 w-8 ${
                                selectedTemplate === "academic"
                                  ? "text-blue-600"
                                  : selectedTemplate === "modern"
                                  ? "text-purple-600"
                                  : selectedTemplate === "minimal"
                                  ? "text-gray-600"
                                  : "text-emerald-600"
                              }`}
                            />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Study Pack Preview
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Your complete{" "}
                            {data.studyPacks.templates
                              .find((t: any) => t.id === selectedTemplate)
                              ?.name.toLowerCase()}{" "}
                            study package will include:
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-left space-y-2">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                                Summary Notes
                              </div>
                              <div className="flex items-center">
                                <Brain className="h-4 w-4 mr-2 text-gray-400" />
                                Flashcards
                              </div>
                            </div>
                            <div className="text-left space-y-2">
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-2 text-gray-400" />
                                Key Concepts
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sharing Options */}
                  <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Sharing & Export Options
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center space-x-2 h-12"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download PDF</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center space-x-2 h-12"
                      >
                        <Copy className="h-5 w-5" />
                        <span>Copy Link</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center space-x-2 h-12"
                      >
                        <Sparkles className="h-5 w-5" />
                        <span>Share Pack</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
