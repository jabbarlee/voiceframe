"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import {
  Edit3,
  Save,
  Eye,
  Settings,
  Search,
  FileText,
  Hash,
  Calendar,
  Clock,
  User,
  Target,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  metaDescription: string;
  content: string;
  tone: "formal" | "conversational" | "professional" | "casual";
  length: "short" | "medium" | "long";
  seoKeywords: string[];
  estimatedReadTime: number;
  wordCount: number;
}

interface BlogPostsProps {
  initialContent: string;
}

export interface BlogPostsRef {
  exportAsText: () => void;
  copyAsText: () => Promise<void>;
  exportAsCSV: () => void;
  addQuestion: () => void;
  addHashtags: () => void;
  addCTA: () => void;
}

export const BlogPosts = forwardRef<BlogPostsRef, BlogPostsProps>(
  ({ initialContent }, ref) => {
    // Parse initial content into blog post format
    const parseInitialPost = (content: string): BlogPost => {
      const sections = content
        .split("\n\n")
        .filter((section) => section.trim());

      // Extract title (first section or create one)
      const title =
        sections[0]?.length > 100
          ? "The Future of Voice Technology in Business"
          : sections[0] || "Professional Blog Post";

      const mainContent = sections.join("\n\n");
      const wordCount = mainContent.split(" ").length;
      const estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed

      // Extract potential keywords
      const keywords = [
        "voice technology",
        "business innovation",
        "AI",
        "productivity",
        "digital transformation",
      ];

      return {
        id: "blog-post-1",
        title,
        metaDescription: mainContent.substring(0, 160) + "...",
        content: mainContent,
        tone: "professional",
        length:
          wordCount < 500 ? "short" : wordCount < 1500 ? "medium" : "long",
        seoKeywords: keywords,
        estimatedReadTime,
        wordCount,
      };
    };

    const [post, setPost] = useState<BlogPost>(
      parseInitialPost(initialContent)
    );
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [showSEOPanel, setShowSEOPanel] = useState(false);

    const updatePost = (field: keyof BlogPost, value: any) => {
      setPost((prev) => {
        const updated = { ...prev, [field]: value };
        if (field === "content") {
          const wordCount = (value as string).split(" ").length;
          updated.wordCount = wordCount;
          updated.estimatedReadTime = Math.ceil(wordCount / 200);
          updated.length =
            wordCount < 500 ? "short" : wordCount < 1500 ? "medium" : "long";
        }
        return updated;
      });
    };

    // Export functions
    const exportAsText = () => {
      const content = `${post.title}\n\n${post.content}\n\nMeta Description: ${
        post.metaDescription
      }\nKeywords: ${post.seoKeywords.join(", ")}\nWord Count: ${
        post.wordCount
      }\nEstimated Read Time: ${post.estimatedReadTime} min`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blog-post.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const copyAsText = async () => {
      const content = `${post.title}\n\n${post.content}`;

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
        `"Title","${post.title.replace(/"/g, '""')}"`,
        `"Meta Description","${post.metaDescription.replace(/"/g, '""')}"`,
        `"Content","${post.content.replace(/"/g, '""')}"`,
        `"Tone","${post.tone}"`,
        `"Length","${post.length}"`,
        `"Keywords","${post.seoKeywords.join("; ").replace(/"/g, '""')}"`,
        `"Word Count","${post.wordCount}"`,
        `"Read Time","${post.estimatedReadTime} minutes"`,
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blog-post.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Enhancement functions
    const addQuestion = () => {
      updatePost(
        "content",
        post.content +
          "\n\nWhat are your thoughts on this topic? Share your experiences in the comments below."
      );
    };

    const addHashtags = () => {
      updatePost(
        "content",
        post.content +
          "\n\nTags: #Innovation #Technology #Business #DigitalTransformation"
      );
    };

    const addCTA = () => {
      updatePost(
        "content",
        post.content +
          "\n\n**Ready to transform your business?** [Get started today] or subscribe to our newsletter for more insights."
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

    const formatContentForPreview = (content: string) => {
      return content
        .split("\n\n")
        .map((paragraph, index) => {
          if (paragraph.startsWith("# ")) {
            return `<h1 class="text-3xl font-bold text-gray-900 mb-4">${paragraph.replace(
              "# ",
              ""
            )}</h1>`;
          } else if (paragraph.startsWith("## ")) {
            return `<h2 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">${paragraph.replace(
              "## ",
              ""
            )}</h2>`;
          } else if (paragraph.startsWith("### ")) {
            return `<h3 class="text-xl font-semibold text-gray-700 mb-2 mt-4">${paragraph.replace(
              "### ",
              ""
            )}</h3>`;
          } else {
            return `<p class="text-gray-700 leading-relaxed mb-4">${paragraph}</p>`;
          }
        })
        .join("");
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Blog Post Editor */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Editor Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    Blog Post Editor
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{post.estimatedReadTime} min read</span>
                  <span>•</span>
                  <span>{post.wordCount} words</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSEOPanel(!showSEOPanel)}
                >
                  <Search className="h-4 w-4 mr-1" />
                  SEO
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {previewMode ? "Edit" : "Preview"}
                </Button>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="p-6 border-b border-gray-50">
            {editingSection === "title" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => updatePost("title", e.target.value)}
                  className="w-full text-2xl font-bold p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your blog post title"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingSection(null)}
                    className="bg-blue-600 hover:bg-blue-700"
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
                  {post.title}
                </h1>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingSection("title")}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6">
            {previewMode ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatContentForPreview(post.content),
                }}
              />
            ) : editingSection === "content" ? (
              <div className="space-y-4">
                <textarea
                  value={post.content}
                  onChange={(e) => updatePost("content", e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Write your blog post content here... Use ## for headings, ### for subheadings"
                />
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Words: {post.wordCount}</span>
                    <span>Read time: {post.estimatedReadTime} min</span>
                    <span>Tone: {post.tone}</span>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={post.tone}
                      onChange={(e) => updatePost("tone", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="formal">Formal</option>
                      <option value="conversational">Conversational</option>
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingSection(null)}
                    className="bg-blue-600 hover:bg-blue-700"
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
                <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
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

        {/* SEO Panel */}
        {showSEOPanel && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              SEO Optimization
            </h4>

            <div className="space-y-4">
              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Meta Description ({post.metaDescription.length}/160)
                </label>
                <textarea
                  value={post.metaDescription}
                  onChange={(e) =>
                    updatePost("metaDescription", e.target.value)
                  }
                  className="w-full p-3 border border-blue-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  maxLength={160}
                  placeholder="Write a compelling meta description for search engines"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  SEO Keywords
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.seoKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {keyword}
                      <button
                        onClick={() => {
                          const newKeywords = post.seoKeywords.filter(
                            (_, i) => i !== index
                          );
                          updatePost("seoKeywords", newKeywords);
                        }}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add keyword and press Enter"
                  className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const value = e.currentTarget.value.trim();
                      if (value && !post.seoKeywords.includes(value)) {
                        updatePost("seoKeywords", [...post.seoKeywords, value]);
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
              </div>

              {/* SEO Suggestions */}
              <div className="bg-white rounded p-4 border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">
                  SEO Suggestions:
                </h5>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>
                    • Include primary keyword in title and first paragraph
                  </li>
                  <li>• Use heading tags (H2, H3) for structure</li>
                  <li>• Add internal and external links</li>
                  <li>• Optimize images with alt text</li>
                  <li>• Keep meta description under 160 characters</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export Options
          </h4>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled>
              HTML Export (Soon)
            </Button>
            <Button size="sm" variant="outline" disabled>
              Markdown (Soon)
            </Button>
            <Button size="sm" variant="outline" disabled>
              Word Document (Soon)
            </Button>
            <Button size="sm" variant="outline" disabled>
              WordPress (Soon)
            </Button>
            <Button size="sm" variant="outline" disabled>
              Ghost CMS (Soon)
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

BlogPosts.displayName = "BlogPosts";
