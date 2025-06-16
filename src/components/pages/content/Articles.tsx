"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import {
  Edit3,
  FileText,
  Quote,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  MapPin,
  Clock,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  headline: string;
  subheading: string;
  byline: string;
  dateline: string;
  content: string;
  template: "news" | "interview" | "opinion" | "feature";
  pullQuotes: string[];
  citations: string[];
  wordCount: number;
  factCheckNotes: string[];
}

interface ArticlesProps {
  initialContent: string;
}

export interface ArticlesRef {
  exportAsText: () => void;
  copyAsText: () => Promise<void>;
  exportAsCSV: () => void;
  addQuestion: () => void;
  addHashtags: () => void;
  addCTA: () => void;
}

export const Articles = forwardRef<ArticlesRef, ArticlesProps>(
  ({ initialContent }, ref) => {
    // Parse initial content into article format
    const parseInitialArticle = (content: string): Article => {
      const sections = content
        .split("\n\n")
        .filter((section) => section.trim());

      const headline =
        sections[0]?.length > 100
          ? "Voice Technology Revolutionizes Business Operations"
          : sections[0] || "Breaking: Industry Innovation";

      const mainContent = sections.join("\n\n");
      const wordCount = mainContent.split(" ").length;

      // Extract potential quotes
      const quotes = sections
        .filter(
          (section) =>
            section.includes('"') ||
            section.includes('"') ||
            section.includes('"')
        )
        .slice(0, 2);

      return {
        id: "article-1",
        headline,
        subheading:
          "Industry leaders report significant productivity gains from AI-powered voice solutions",
        byline: "By [Your Name]",
        dateline: `${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        content: mainContent,
        template: "feature",
        pullQuotes:
          quotes.length > 0
            ? quotes
            : ["Technology is reshaping how we work and communicate"],
        citations: ["Industry Research Report 2024", "Voice Technology Survey"],
        wordCount,
        factCheckNotes: [],
      };
    };

    const [article, setArticle] = useState<Article>(
      parseInitialArticle(initialContent)
    );
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [showFactCheck, setShowFactCheck] = useState(false);

    const updateArticle = (field: keyof Article, value: any) => {
      setArticle((prev) => {
        const updated = { ...prev, [field]: value };
        if (field === "content") {
          updated.wordCount = (value as string).split(" ").length;
        }
        return updated;
      });
    };

    // Export functions
    const exportAsText = () => {
      const content = `${article.headline}\n${article.subheading}\n\n${
        article.byline
      }\n${article.dateline}\n\n${
        article.content
      }\n\nCitations:\n${article.citations.join("\n")}\n\nWord Count: ${
        article.wordCount
      }`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "article.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const copyAsText = async () => {
      const content = `${article.headline}\n\n${article.content}`;

      try {
        await navigator.clipboard.writeText(content);
      } catch (error) {
        console.error("Failed to copy text:", error);
        throw error;
      }
    };

    const exportAsCSV = () => {
      const csvContent = [
        "Field,Content",
        `"Headline","${article.headline.replace(/"/g, '""')}"`,
        `"Subheading","${article.subheading.replace(/"/g, '""')}"`,
        `"Byline","${article.byline.replace(/"/g, '""')}"`,
        `"Dateline","${article.dateline.replace(/"/g, '""')}"`,
        `"Content","${article.content.replace(/"/g, '""')}"`,
        `"Template","${article.template}"`,
        `"Word Count","${article.wordCount}"`,
        `"Pull Quotes","${article.pullQuotes.join("; ").replace(/"/g, '""')}"`,
        `"Citations","${article.citations.join("; ").replace(/"/g, '""')}"`,
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "article.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Enhancement functions
    const addQuestion = () => {
      updateArticle(
        "content",
        article.content +
          "\n\nWhat questions does this raise for your organization? Industry experts encourage businesses to consider these implications carefully."
      );
    };

    const addHashtags = () => {
      updateArticle(
        "content",
        article.content +
          "\n\n[Tags: #BusinessNews #Technology #Innovation #Industry]"
      );
    };

    const addCTA = () => {
      updateArticle(
        "content",
        article.content +
          "\n\n*For more coverage on this developing story, subscribe to our newsletter or follow our ongoing coverage.*"
      );
    };

    useImperativeHandle(ref, () => ({
      exportAsText,
      copyAsText,
      exportAsCSV,
      addQuestion,
      addHashtags,
      addCTA,
    }));

    const templateOptions = [
      { value: "news", label: "News Report", icon: "📰" },
      { value: "interview", label: "Interview", icon: "🎤" },
      { value: "opinion", label: "Opinion Piece", icon: "💭" },
      { value: "feature", label: "Feature Article", icon: "📝" },
    ];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Article Editor */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Article Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold text-gray-900">
                    Article Editor
                  </span>
                </div>
                <select
                  value={article.template}
                  onChange={(e) => updateArticle("template", e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
                >
                  {templateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{article.wordCount} words</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFactCheck(!showFactCheck)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Fact Check
                </Button>
              </div>
            </div>
          </div>

          {/* Headline & Subheading */}
          <div className="p-6 border-b border-gray-50 space-y-4">
            {/* Headline */}
            {editingSection === "headline" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={article.headline}
                  onChange={(e) => updateArticle("headline", e.target.value)}
                  className="w-full text-2xl font-bold p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter article headline"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingSection(null)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {article.headline}
                </h1>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingSection("headline")}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Subheading */}
            {editingSection === "subheading" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={article.subheading}
                  onChange={(e) => updateArticle("subheading", e.target.value)}
                  className="w-full text-lg text-gray-600 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter subheading"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingSection(null)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <h2 className="text-lg text-gray-600 leading-relaxed">
                  {article.subheading}
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingSection("subheading")}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Byline & Dateline */}
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-25">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{article.byline}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{article.dateline}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Newsroom</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {editingSection === "content" ? (
              <div className="space-y-4">
                <textarea
                  value={article.content}
                  onChange={(e) => updateArticle("content", e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif text-base leading-relaxed"
                  placeholder="Write your article content here..."
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingSection(null)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap font-serif">
                  {article.content}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingSection("content")}
                  className="absolute top-0 right-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pull Quotes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
            <Quote className="h-4 w-4 mr-2" />
            Pull Quotes
          </h4>

          <div className="space-y-2">
            {article.pullQuotes.map((quote, index) => (
              <div
                key={index}
                className="bg-white rounded p-3 border border-yellow-200"
              >
                <p className="text-gray-700 italic">"{quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fact Check Panel */}
        {showFactCheck && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Fact Check & Citations
            </h4>

            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-red-800 mb-2">
                  Citations & Sources:
                </h5>
                <div className="space-y-2">
                  {article.citations.map((citation, index) => (
                    <div
                      key={index}
                      className="bg-white rounded p-2 border border-red-200 text-sm"
                    >
                      {citation}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded p-3 border border-red-200">
                <h5 className="font-medium text-red-800 mb-2">
                  Fact-checking reminders:
                </h5>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• Verify all statistics and claims</li>
                  <li>• Check spelling of names and places</li>
                  <li>• Confirm quotes are accurate</li>
                  <li>• Validate source credibility</li>
                  <li>• Cross-reference with multiple sources</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export & Publish
          </h4>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled>
              DOCX Export (Soon)
            </Button>
            <Button size="sm" variant="outline" disabled>
              PDF Export (Soon)
            </Button>
            <Button size="sm" variant="outline" disabled>
              Email Ready (Soon)
            </Button>
            <Button size="sm" variant="outline" disabled>
              CMS Integration (Soon)
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

Articles.displayName = "Articles";
