"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Send,
  Edit3,
  Clock,
  Users,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkedInPost {
  id: string;
  headline: string;
  content: string;
  summary: string;
  characterCount: number;
  suggestedTimes: string[];
}

interface LinkedInPostsProps {
  initialContent: string;
}

export interface LinkedInPostsRef {
  exportAsText: () => void;
  copyAsText: () => Promise<void>;
  exportAsCSV: () => void;
  addQuestion: () => void;
  addHashtags: () => void;
  addCTA: () => void;
}

export const LinkedInPosts = forwardRef<LinkedInPostsRef, LinkedInPostsProps>(
  ({ initialContent }, ref) => {
    // Parse initial content into LinkedIn post format
    const parseInitialPost = (content: string): LinkedInPost => {
      const sections = content
        .split("\n\n")
        .filter((section) => section.trim());

      const headline =
        sections[0]?.length > 100
          ? "Transform Your Business with Voice Technology"
          : sections[0] || "Professional Insight";

      const mainContent = sections.join("\n\n");

      const summary =
        mainContent.length > 200
          ? mainContent.substring(0, 200) + "..."
          : mainContent;

      return {
        id: "linkedin-post-1",
        headline,
        content: mainContent,
        summary,
        characterCount: mainContent.length,
        suggestedTimes: [
          "Tuesday 8-10 AM",
          "Wednesday 12-2 PM",
          "Thursday 9-11 AM",
        ],
      };
    };

    const [post, setPost] = useState<LinkedInPost>(
      parseInitialPost(initialContent)
    );
    const [editingSection, setEditingSection] = useState<string | null>(null);

    const updatePost = (
      field: keyof LinkedInPost,
      value: string | string[]
    ) => {
      setPost((prev) => ({
        ...prev,
        [field]: value,
        characterCount:
          field === "content" ? (value as string).length : prev.characterCount,
      }));
    };

    // Export functions
    const exportAsText = () => {
      const content = `${post.headline}\n\n${
        post.content
      }\n\nOptimal posting times: ${post.suggestedTimes.join(", ")}`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "linkedin-post.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const copyAsText = async () => {
      const content = `${post.headline}\n\n${post.content}`;

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
        `"Headline","${post.headline.replace(/"/g, '""')}"`,
        `"Content","${post.content.replace(/"/g, '""')}"`,
        `"Character Count","${post.characterCount}"`,
        `"Suggested Times","${post.suggestedTimes
          .join("; ")
          .replace(/"/g, '""')}"`,
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "linkedin-post.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Enhancement functions
    const addQuestion = () => {
      updatePost(
        "content",
        post.content + "\n\nWhat are your thoughts on this?"
      );
    };

    const addHashtags = () => {
      updatePost(
        "content",
        post.content + " #Innovation #Leadership #BusinessStrategy"
      );
    };

    const addCTA = () => {
      updatePost(
        "content",
        post.content + "\n\n👉 Follow for more insights on business innovation"
      );
    };

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
      exportAsText,
      copyAsText,
      exportAsCSV,
      addQuestion,
      addHashtags,
      addCTA,
    }));

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* LinkedIn Post Preview */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Post Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">YB</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Your Business</h4>
                <p className="text-sm text-gray-600">Thought Leader • 1st</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  2h • <span className="ml-1">🌍</span>
                </p>
              </div>
            </div>
          </div>

          {/* Headline Section */}
          <div className="p-4 border-b border-gray-50">
            {editingSection === "headline" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={post.headline}
                  onChange={(e) => updatePost("headline", e.target.value)}
                  className="w-full text-lg font-semibold p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Professional headline"
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
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {post.headline}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingSection("headline")}
                  className="ml-2"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="p-4">
            {editingSection === "content" ? (
              <div className="space-y-3">
                <textarea
                  value={post.content}
                  onChange={(e) => updatePost("content", e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your professional insights..."
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {post.characterCount} characters
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updatePost(
                          "content",
                          post.content + " #Innovation #Leadership"
                        )
                      }
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      Add Hashtags
                    </Button>
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
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* LinkedIn Actions */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>👍 Sarah Wilson and 247 others</span>
              <span>32 comments • 18 reposts</span>
            </div>
            <div className="flex items-center justify-between">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition-colors">
                <ThumbsUp className="h-4 w-4" />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition-colors">
                <Repeat2 className="h-4 w-4" />
                <span>Repost</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition-colors">
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Engagement Strategy */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Engagement Strategy
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-800 mb-2">
                Optimal Posting Times:
              </h5>
              <ul className="space-y-1 text-green-700">
                {post.suggestedTimes.map((time, index) => (
                  <li key={index} className="flex items-center">
                    <Clock className="h-3 w-3 mr-2" />
                    {time}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-green-800 mb-2">
                Engagement Tips:
              </h5>
              <ul className="space-y-1 text-green-700 text-xs">
                <li>• Ask a question to encourage comments</li>
                <li>• Share personal experiences</li>
                <li>• Use 3-5 relevant hashtags</li>
                <li>• Tag relevant connections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LinkedInPosts.displayName = "LinkedInPosts";
