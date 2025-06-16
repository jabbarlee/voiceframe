"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  Edit3,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tweet {
  id: string;
  content: string;
  characterCount: number;
  order: number;
}

interface TwitterThreadsProps {
  initialContent: string;
}

export interface TwitterThreadsRef {
  exportAsText: () => void;
  copyAsText: () => Promise<void>;
  exportAsCSV: () => void;
  addQuestion: () => void;
  addHashtags: () => void;
  addCTA: () => void;
}

export const TwitterThreads = forwardRef<
  TwitterThreadsRef,
  TwitterThreadsProps
>(({ initialContent }, ref) => {
  // Parse initial content into logical tweets
  const parseInitialTweets = (content: string): Tweet[] => {
    // Split by double line breaks first, then by single line breaks for bullet points
    const sections = content.split("\n\n").filter((section) => section.trim());
    const tweets: Tweet[] = [];

    sections.forEach((section) => {
      const trimmedSection = section.trim();

      // If it's a bullet point section, treat each bullet as part of one tweet
      if (trimmedSection.includes("•") || trimmedSection.includes("→")) {
        const lines = trimmedSection.split("\n");
        const mainText = lines[0];
        const bulletPoints = lines
          .slice(1)
          .filter(
            (line) => line.trim().startsWith("•") || line.trim().startsWith("→")
          );

        // Combine main text with bullet points
        const fullContent = [mainText, ...bulletPoints].join("\n");

        tweets.push({
          id: `tweet-${tweets.length}`,
          content: fullContent,
          characterCount: fullContent.length,
          order: tweets.length + 1,
        });
      } else {
        // Regular paragraph - add as single tweet
        tweets.push({
          id: `tweet-${tweets.length}`,
          content: trimmedSection,
          characterCount: trimmedSection.length,
          order: tweets.length + 1,
        });
      }
    });

    return tweets;
  };

  const [tweets, setTweets] = useState<Tweet[]>(
    parseInitialTweets(initialContent)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const updateTweet = (id: string, newContent: string) => {
    setTweets(
      tweets.map((tweet) =>
        tweet.id === id
          ? { ...tweet, content: newContent, characterCount: newContent.length }
          : tweet
      )
    );
  };

  const deleteTweet = (id: string) => {
    setTweets(
      tweets
        .filter((tweet) => tweet.id !== id)
        .map((tweet, index) => ({
          ...tweet,
          order: index + 1,
        }))
    );
  };

  const reorderTweets = (startIndex: number, endIndex: number) => {
    const result = Array.from(tweets);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const reorderedTweets = result.map((tweet, index) => ({
      ...tweet,
      order: index + 1,
    }));

    setTweets(reorderedTweets);
  };

  const suggestHashtags = (content: string): string[] => {
    const suggestions = [
      "#VoiceTech",
      "#AI",
      "#Innovation",
      "#TechTrends",
      "#DigitalTransformation",
    ];
    return suggestions.slice(0, 3);
  };

  // Export functions
  const exportAsText = () => {
    const content = tweets
      .map((tweet, index) => `${index + 1}/${tweets.length} ${tweet.content}`)
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "twitter-thread.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyAsText = async () => {
    const content = tweets
      .map((tweet, index) => `${index + 1}/${tweets.length} ${tweet.content}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy text:", error);
      throw error;
    }
  };

  const exportAsCSV = () => {
    const csvContent = [
      "Tweet Number,Content,Character Count",
      ...tweets.map(
        (tweet) =>
          `${tweet.order},"${tweet.content.replace(/"/g, '""')}",${
            tweet.characterCount
          }`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "twitter-thread.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enhancement functions
  const addQuestion = () => {
    const lastTweet = tweets[tweets.length - 1];
    if (lastTweet) {
      updateTweet(lastTweet.id, lastTweet.content + "\n\nWhat are your thoughts? 🤔");
    }
  };

  const addHashtags = () => {
    const lastTweet = tweets[tweets.length - 1];
    if (lastTweet) {
      const hashtags = suggestHashtags(lastTweet.content);
      updateTweet(lastTweet.id, `${lastTweet.content} ${hashtags.join(" ")}`);
    }
  };

  const addCTA = () => {
    const lastTweet = tweets[tweets.length - 1];
    if (lastTweet) {
      updateTweet(lastTweet.id, lastTweet.content + "\n\n👉 Follow for more insights like this!");
    }
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

  const TweetCard = ({ tweet, index }: { tweet: Tweet; index: number }) => {
    const isEditing = editingId === tweet.id;
    const characterLimit = 280;
    const isOverLimit = tweet.characterCount > characterLimit;

    return (
      <div
        className="bg-white border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-md transition-shadow"
        draggable
        onDragStart={() => setDraggedItem(tweet.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (draggedItem) {
            const dragIndex = tweets.findIndex((t) => t.id === draggedItem);
            const dropIndex = index;
            if (dragIndex !== dropIndex) {
              reorderTweets(dragIndex, dropIndex);
            }
            setDraggedItem(null);
          }
        }}
      >
        <div className="flex items-start space-x-3">
          {/* Drag Handle */}
          <div className="cursor-move pt-1">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          {/* Profile Picture */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">U</span>
          </div>

          {/* Tweet Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-bold text-gray-900">Your Business</h4>
              <span className="text-blue-500">✓</span>
              <span className="text-gray-500 text-sm">@yourbusiness</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">now</span>
              <span className="text-blue-500 text-sm font-medium">
                {tweet.order}/{tweets.length}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={tweet.content}
                  onChange={(e) => updateTweet(tweet.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="What's happening?"
                />

                {/* Character Count */}
                <div className="flex items-center justify-between">
                  <div
                    className={`text-sm ${
                      isOverLimit ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {tweet.characterCount}/{characterLimit}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingId(null)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-gray-900 whitespace-pre-wrap leading-relaxed mb-3">
                  {tweet.content || (
                    <span className="text-gray-400 italic">
                      Empty tweet - click edit to add content
                    </span>
                  )}
                </div>

                {/* Character Count Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      isOverLimit
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tweet.characterCount}/{characterLimit}
                  </div>

                  {/* Edit Controls */}
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(tweet.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    {tweets.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTweet(tweet.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Twitter Actions */}
                <div className="flex items-center justify-between max-w-md">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">12</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                    <Repeat2 className="h-4 w-4" />
                    <span className="text-sm">8</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">24</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {tweets.map((tweet, index) => (
        <TweetCard key={tweet.id} tweet={tweet} index={index} />
      ))}
    </div>
  );
});

TwitterThreads.displayName = "TwitterThreads";
