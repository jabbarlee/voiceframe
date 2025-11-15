"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  BookOpen,
  Brain,
  Target,
  Clock,
  User,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
    eli5: {
      title: string;
      sections: { heading: string; content: string }[];
    };
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
      sourceType?: string;
      wordComplexity?: string;
    };
    stats: {
      totalPages: number;
      wordCount: number;
      readingTime: string;
      studyTime?: string;
      concepts: number;
      flashcards: number;
      sections?: number;
    };
  };
}

type SummaryTone = "professional" | "friendly" | "eli5";
type StudyPackTemplate = "academic" | "modern" | "minimal" | "creative";

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentData: ContentData;
  selectedTemplate: StudyPackTemplate;
  summaryTone: SummaryTone;
}

export function ContentPreviewModal({
  isOpen,
  onClose,
  contentData,
  selectedTemplate,
  summaryTone,
}: ContentPreviewModalProps) {
  const [expandedFlashcard, setExpandedFlashcard] = useState<number | null>(
    null
  );
  const [expandedSection, setExpandedSection] = useState<string>("summary");

  const getTemplateColors = () => {
    switch (selectedTemplate) {
      case "academic":
        return {
          primary: "blue",
          accent: "bg-blue-50 border-blue-200",
          text: "text-blue-900",
          button: "bg-blue-600 hover:bg-blue-700",
        };
      case "modern":
        return {
          primary: "purple",
          accent: "bg-purple-50 border-purple-200",
          text: "text-purple-900",
          button: "bg-purple-600 hover:bg-purple-700",
        };
      case "minimal":
        return {
          primary: "gray",
          accent: "bg-gray-50 border-gray-200",
          text: "text-gray-900",
          button: "bg-gray-600 hover:bg-gray-700",
        };
      case "creative":
        return {
          primary: "emerald",
          accent: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-900",
          button: "bg-emerald-600 hover:bg-emerald-700",
        };
    }
  };

  const colors = getTemplateColors();

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, "<br/>")
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, "</p>")
      .replace(/• (.*?)(<br\/?>|<\/p>)/g, '<li class="ml-4 list-disc">$1</li>')
      .replace(/<li/g, '<ul class="list-disc ml-4 mb-4 space-y-1"><li')
      .replace(/li><\/p>/g, "li></ul>");
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
    sectionKey,
    badge,
  }: {
    icon: any;
    title: string;
    subtitle: string;
    sectionKey: string;
    badge?: string;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className={`w-full text-left p-6 border-2 rounded-xl transition-all duration-200 ${
        expandedSection === sectionKey
          ? `${colors.accent} ${colors.text} shadow-sm`
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              expandedSection === sectionKey
                ? colors.primary === "blue"
                  ? "bg-blue-100"
                  : colors.primary === "purple"
                  ? "bg-purple-100"
                  : colors.primary === "gray"
                  ? "bg-gray-100"
                  : "bg-emerald-100"
                : "bg-gray-100"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                expandedSection === sectionKey
                  ? colors.primary === "blue"
                    ? "text-blue-600"
                    : colors.primary === "purple"
                    ? "text-purple-600"
                    : colors.primary === "gray"
                    ? "text-gray-600"
                    : "text-emerald-600"
                  : "text-gray-600"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        {expandedSection === sectionKey ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </button>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Study Pack Preview
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {contentData.audioTitle} •{" "}
                        {selectedTemplate.charAt(0).toUpperCase() +
                          selectedTemplate.slice(1)}{" "}
                        Template
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {summaryTone.charAt(0).toUpperCase() +
                          summaryTone.slice(1)}{" "}
                        Tone
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Title Page Section */}
                    <div className={`p-8 rounded-xl border-2 ${colors.accent}`}>
                      <div className="text-center space-y-4">
                        <h1 className={`text-3xl font-bold ${colors.text}`}>
                          {contentData.studyPacks.metadata.title}
                        </h1>
                        <p className="text-xl text-gray-600">
                          {contentData.studyPacks.metadata.subtitle}
                        </p>

                        <div className="flex justify-center space-x-6 text-sm text-gray-600 mt-6">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{contentData.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>
                              {contentData.studyPacks.metadata.author}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(
                                contentData.processedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-center flex-wrap gap-2 mt-4">
                          {contentData.studyPacks.metadata.tags.map(
                            (tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Study Pack Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-2xl font-bold text-indigo-600">
                          {contentData.studyPacks.stats.totalPages}
                        </div>
                        <div className="text-sm text-gray-600">Pages</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                          {contentData.studyPacks.stats.wordCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Words</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">
                          {contentData.studyPacks.stats.concepts}
                        </div>
                        <div className="text-sm text-gray-600">Concepts</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-2xl font-bold text-emerald-600">
                          {contentData.studyPacks.stats.flashcards}
                        </div>
                        <div className="text-sm text-gray-600">Flashcards</div>
                      </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-4">
                      {/* Summary Section */}
                      <SectionHeader
                        icon={BookOpen}
                        title="Summary Notes"
                        subtitle={`${contentData.summary[summaryTone].sections.length} sections • ${summaryTone} tone`}
                        sectionKey="summary"
                        badge={summaryTone}
                      />

                      {expandedSection === "summary" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 ml-4 shadow-sm">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                            {contentData.summary[summaryTone].title}
                          </h2>

                          {contentData.summary[summaryTone].sections.map(
                            (section, index) => (
                              <div key={index} className="mb-8 last:mb-0">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                  <div
                                    className={`w-2 h-6 ${colors.button} rounded-full mr-3`}
                                  ></div>
                                  {section.heading}
                                </h3>
                                <div
                                  className="text-gray-700 leading-relaxed prose prose-gray max-w-none"
                                  dangerouslySetInnerHTML={{
                                    __html: formatContent(section.content),
                                  }}
                                />
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Flashcards Section */}
                      <SectionHeader
                        icon={Brain}
                        title="Interactive Flashcards"
                        subtitle={`${contentData.flashcards.length} cards for active recall`}
                        sectionKey="flashcards"
                        badge={`${contentData.flashcards.length} cards`}
                      />

                      {expandedSection === "flashcards" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 ml-4 shadow-sm">
                          <div className="space-y-4">
                            {contentData.flashcards.map((card) => (
                              <div
                                key={card.id}
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                              >
                                <button
                                  onClick={() =>
                                    setExpandedFlashcard(
                                      expandedFlashcard === card.id
                                        ? null
                                        : card.id
                                    )
                                  }
                                  className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`w-8 h-8 rounded-full ${colors.button} text-white flex items-center justify-center text-sm font-semibold`}
                                      >
                                        {card.id}
                                      </div>
                                      <div className="font-medium text-gray-900">
                                        {card.question}
                                      </div>
                                    </div>
                                    {expandedFlashcard === card.id ? (
                                      <ChevronUp className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                </button>

                                {expandedFlashcard === card.id && (
                                  <div className="p-4 bg-white border-t border-gray-200">
                                    <div className="flex items-start space-x-2">
                                      <ArrowRight
                                        className={`h-4 w-4 mt-1 ${
                                          colors.primary === "blue"
                                            ? "text-blue-600"
                                            : colors.primary === "purple"
                                            ? "text-purple-600"
                                            : colors.primary === "gray"
                                            ? "text-gray-600"
                                            : "text-emerald-600"
                                        }`}
                                      />
                                      <p className="text-gray-700 leading-relaxed">
                                        {card.answer}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Concepts Section */}
                      <SectionHeader
                        icon={Target}
                        title="Key Concepts"
                        subtitle={`${contentData.concepts.length} essential terms and definitions`}
                        sectionKey="concepts"
                        badge={`${contentData.concepts.length} terms`}
                      />

                      {expandedSection === "concepts" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 ml-4 shadow-sm">
                          <div className="space-y-6">
                            {/* Display all concepts in a single group */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div
                                  className={`w-3 h-3 ${colors.button} rounded-full mr-2`}
                                ></div>
                                Key Terms & Concepts
                              </h3>
                              <div className="space-y-3">
                                {contentData.concepts.map((concept, index) => (
                                  <div
                                    key={index}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      {concept.term}
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed">
                                      {concept.definition}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata Section */}
                      <SectionHeader
                        icon={FileText}
                        title="Study Pack Metadata"
                        subtitle="Generation details and statistics"
                        sectionKey="metadata"
                      />

                      {expandedSection === "metadata" && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 ml-4 shadow-sm">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-3">
                                Generation Info
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Generated:
                                  </span>
                                  <span className="font-medium">
                                    {new Date(
                                      contentData.processedAt
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Level:</span>
                                  <span className="font-medium">
                                    {contentData.studyPacks.metadata.level}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Reading Time:
                                  </span>
                                  <span className="font-medium">
                                    {contentData.studyPacks.stats.readingTime}
                                  </span>
                                </div>
                                {contentData.studyPacks.stats.studyTime && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Study Time:
                                    </span>
                                    <span className="font-medium">
                                      {contentData.studyPacks.stats.studyTime}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold text-gray-900 mb-3">
                                Content Stats
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Word Count:
                                  </span>
                                  <span className="font-medium">
                                    {contentData.studyPacks.stats.wordCount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Flashcards:
                                  </span>
                                  <span className="font-medium">
                                    {contentData.studyPacks.stats.flashcards}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Concepts:
                                  </span>
                                  <span className="font-medium">
                                    {contentData.studyPacks.stats.concepts}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Est. Pages:
                                  </span>
                                  <span className="font-medium">
                                    {contentData.studyPacks.stats.totalPages}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        Generated by VoiceFrame AI •{" "}
                        {selectedTemplate.charAt(0).toUpperCase() +
                          selectedTemplate.slice(1)}{" "}
                        Template
                      </span>
                    </div>
                    <Button onClick={onClose} className={colors.button}>
                      Close Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
