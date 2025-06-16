"use client";

import { useState } from "react";
import {
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Hash,
  AtSign,
  ImageIcon,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialMediaContent {
  twitterThread: Array<{ id: string; content: string; hashtags: string[] }>;
  instagramCaption: { content: string; hashtags: string[]; mentions: string[] };
  linkedinPost: { content: string; hashtags: string[] };
  facebookPost: { content: string; hashtags: string[] };
}

export function MarketingSocialMedia() {
  const [activeFormat, setActiveFormat] = useState("twitter");

  const mockContent: SocialMediaContent = {
    twitterThread: [
      {
        id: "1",
        content:
          "🎙️ Voice technology is transforming how businesses create content. Here's what we're seeing across industries... (1/5)",
        hashtags: ["#VoiceTech", "#ContentCreation", "#AI"],
      },
      {
        id: "2",
        content:
          "📈 Marketing teams report 70% faster content production when using voice-to-text workflows. No more writer's block! (2/5)",
        hashtags: ["#Marketing", "#Productivity"],
      },
      {
        id: "3",
        content:
          "🎯 The best part? Voice captures authentic tone and personality that's often lost in traditional writing processes. (3/5)",
        hashtags: ["#Authenticity", "#BrandVoice"],
      },
      {
        id: "4",
        content:
          "💡 Pro tip: Record your ideas during commutes, walks, or whenever inspiration strikes. Transform dead time into creative time! (4/5)",
        hashtags: ["#ProductivityTips", "#Innovation"],
      },
      {
        id: "5",
        content:
          "🚀 Ready to revolutionize your content workflow? Share your thoughts below or DM us for a demo! (5/5)",
        hashtags: ["#GetStarted", "#Demo"],
      },
    ],
    instagramCaption: {
      content:
        "✨ From voice memo to viral content ✨\n\nJust recorded a quick voice note about our latest product update and turned it into this entire campaign! 🎙️➡️📱\n\nThe future of content creation is speaking your mind—literally. No more staring at blank screens or struggling with writer's block.\n\nSwipe to see the behind-the-scenes process 👉",
      hashtags: [
        "#VoiceContent",
        "#ContentCreator",
        "#Innovation",
        "#BehindTheScenes",
        "#TechLife",
        "#ProductivityHack",
      ],
      mentions: ["@voiceframe", "@techstartups"],
    },
    linkedinPost: {
      content:
        "The content creation landscape has fundamentally shifted.\n\nTraditional workflows—brainstorm, outline, write, edit, publish—are being replaced by voice-first approaches that capture authentic thoughts in real-time.\n\nAfter implementing voice technology in our content process:\n• 70% reduction in content creation time\n• 85% increase in authentic brand voice\n• 90% improvement in idea capture rate\n\nThe most successful content creators of 2024 will be those who master the art of speaking their ideas into existence.\n\nWhat's your take on voice-driven content creation? Share your experiences below. 👇",
      hashtags: [
        "#ContentStrategy",
        "#VoiceTechnology",
        "#DigitalTransformation",
        "#ThoughtLeadership",
      ],
    },
    facebookPost: {
      content:
        "🎙️ Game-changing discovery for content creators!\n\nRemember when creating social media content took hours? Those days are officially over.\n\nWe just tested voice-to-content technology for our marketing team, and the results are incredible:\n\n✅ 5-minute voice memo → Full week of social posts\n✅ Natural, conversational tone automatically preserved\n✅ Multiple formats generated instantly\n✅ SEO optimization built-in\n\nThe future of content creation isn't about typing faster—it's about speaking naturally and letting technology handle the rest.\n\nWho else is ready to ditch the keyboard? 🙋‍♀️",
      hashtags: [
        "#ContentCreation",
        "#SocialMediaTips",
        "#VoiceTech",
        "#MarketingInnovation",
      ],
    },
  };

  const formatOptions = [
    {
      id: "twitter",
      label: "Twitter Thread",
      icon: Twitter,
      color: "text-blue-500",
    },
    {
      id: "instagram",
      label: "Instagram Post",
      icon: Instagram,
      color: "text-pink-500",
    },
    {
      id: "linkedin",
      label: "LinkedIn Post",
      icon: Linkedin,
      color: "text-blue-600",
    },
    {
      id: "facebook",
      label: "Facebook Post",
      icon: Facebook,
      color: "text-blue-700",
    },
  ];

  const renderTwitterThread = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          Twitter Thread Preview
        </h3>
        <p className="text-blue-700 text-sm">
          Total tweets: {mockContent.twitterThread.length} | Estimated reach:
          2.5K-5K
        </p>
      </div>

      {mockContent.twitterThread.map((tweet, index) => (
        <div
          key={tweet.id}
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">YB</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-bold text-gray-900">Your Business</span>
                <span className="text-blue-500">✓</span>
                <span className="text-gray-500 text-sm">@yourbusiness</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-sm">2h</span>
              </div>
              <p className="text-gray-900 leading-relaxed mb-3">
                {tweet.content}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {tweet.hashtags.map((tag, i) => (
                  <span key={i} className="text-blue-500 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-6 text-gray-500 text-sm">
                <span>💬 {Math.floor(Math.random() * 20) + 5}</span>
                <span>🔄 {Math.floor(Math.random() * 15) + 2}</span>
                <span>❤️ {Math.floor(Math.random() * 50) + 10}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInstagramPost = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full"></div>
            <div>
              <span className="font-semibold text-sm">yourbusiness</span>
              <p className="text-xs text-gray-500">Sponsored</p>
            </div>
          </div>
        </div>

        <div className="aspect-square bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-white opacity-50" />
        </div>

        <div className="p-3">
          <div className="flex items-center space-x-4 mb-3">
            <span>❤️ 247</span>
            <span>💬 18</span>
            <span>📤</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">yourbusiness</span>
            <span className="ml-2">{mockContent.instagramCaption.content}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {mockContent.instagramCaption.hashtags.map((tag, i) => (
              <span key={i} className="text-blue-600 text-sm">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">2 HOURS AGO</p>
        </div>
      </div>
    </div>
  );

  const renderLinkedInPost = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">YB</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Your Business</h4>
          <p className="text-sm text-gray-600">Thought Leader • 1st</p>
          <p className="text-xs text-gray-500">2h • 🌍</p>
        </div>
      </div>

      <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-line mb-4">
        {mockContent.linkedinPost.content}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {mockContent.linkedinPost.hashtags.map((tag, i) => (
          <span key={i} className="text-blue-600 text-sm">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-3">
        <span>👍 Sarah Wilson and 42 others</span>
        <span>8 comments</span>
      </div>
    </div>
  );

  const renderFacebookPost = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">YB</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Your Business</h4>
          <p className="text-xs text-gray-500">2 hours ago • 🌍</p>
        </div>
      </div>

      <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-line mb-4">
        {mockContent.facebookPost.content}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {mockContent.facebookPost.hashtags.map((tag, i) => (
          <span key={i} className="text-blue-600 text-sm">
            {tag}
          </span>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>👍❤️😊 You and 156 others</span>
          <span>23 comments • 7 shares</span>
        </div>
        <div className="flex items-center space-x-4 text-gray-600">
          <button className="flex items-center space-x-1 hover:bg-gray-50 px-3 py-2 rounded">
            <span>👍</span>
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center space-x-1 hover:bg-gray-50 px-3 py-2 rounded">
            <span>💬</span>
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center space-x-1 hover:bg-gray-50 px-3 py-2 rounded">
            <span>📤</span>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Format Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Social Media Formats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {formatOptions.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setActiveFormat(format.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  activeFormat === format.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className={`h-6 w-6 ${format.color} mx-auto mb-2`} />
                <p className="text-sm font-medium text-gray-900">
                  {format.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        {activeFormat === "twitter" && renderTwitterThread()}
        {activeFormat === "instagram" && renderInstagramPost()}
        {activeFormat === "linkedin" && renderLinkedInPost()}
        {activeFormat === "facebook" && renderFacebookPost()}
      </div>

      {/* Analytics & Optimization */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-semibold text-green-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Optimization Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <span className="font-medium text-green-800">
              Best Posting Time:
            </span>
            <p className="text-green-700">Tuesday 2-4 PM</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <span className="font-medium text-green-800">
              Engagement Score:
            </span>
            <p className="text-green-700">8.5/10</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <span className="font-medium text-green-800">Hashtag Reach:</span>
            <p className="text-green-700">5K-15K potential</p>
          </div>
        </div>
      </div>
    </div>
  );
}
