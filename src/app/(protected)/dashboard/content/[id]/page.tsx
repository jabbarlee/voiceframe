"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Instagram,
  Twitter,
  Lightbulb,
  Copy,
  Download,
  Loader2,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Bookmark,
  Calendar,
  Clock,
  User,
  Eye,
  Target,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const [activeTab, setActiveTab] = useState("blog");
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [copiedContent, setCopiedContent] = useState<string | null>(null);

  // Mock content types with individual tweets for pagination
  const contentTypes: ContentType[] = [
    {
      id: "blog",
      title: "Blog Post",
      description: "Transform your audio into a comprehensive blog post",
      icon: FileText,
      items: [
        {
          id: 1,
          content: `# The Future of Voice Technology in Business

In today's rapidly evolving digital landscape, voice technology has emerged as a transformative force that's reshaping how businesses operate and communicate. From automated transcription services to AI-powered content generation, the possibilities are endless.

## Key Benefits of Voice Technology

### 1. Enhanced Productivity
Voice technology significantly reduces the time spent on manual tasks like note-taking and content creation. By converting spoken words into text and then into various content formats, businesses can streamline their workflows and focus on higher-value activities.

### 2. Improved Accessibility
Voice interfaces make technology more accessible to users with different abilities and preferences. This inclusivity not only expands your potential audience but also demonstrates a commitment to universal design principles.

### 3. Cost-Effective Solutions
Implementing voice technology can lead to substantial cost savings through automation of repetitive tasks and reduced need for manual transcription services.

## The Road Ahead

As we look to the future, voice technology will continue to evolve, offering even more sophisticated capabilities. Businesses that embrace these innovations today will be well-positioned to leverage tomorrow's advancements.

The integration of voice technology isn't just about keeping up with trends—it's about reimagining how we work, communicate, and create value in an increasingly connected world.`,
        },
      ],
    },
    {
      id: "instagram",
      title: "Instagram Posts",
      description: "Create engaging Instagram content and captions",
      icon: Instagram,
      items: [
        {
          id: 1,
          content: `🎙️ Just discovered the power of voice technology in business! 

From automated transcription to AI-powered content creation, the future is HERE ✨

Key takeaways:
📈 Boosts productivity by 70%
🌍 Makes tech more accessible 
💰 Reduces operational costs
🚀 Streamlines workflows

Are you ready to transform your business with voice tech? Drop a 🔥 if you're excited about the possibilities!

#VoiceTech #DigitalTransformation #BusinessInnovation #AI #Productivity #TechTrends #Innovation #FutureOfWork`,
        },
        {
          id: 2,
          content: `🎯 The way we create content is changing FAST 🏃‍♂️

Imagine:
→ Speaking your ideas
→ Getting a full blog post
→ Plus social media content
→ In just minutes!

That's the magic of voice-to-content technology 🪄

What would you create if writing wasn't a barrier? Tell me below! 👇

#ContentCreation #VoiceFirst #AIWriting #CreativeProcess #TechLife #Innovation #SpeakYourMind #ContentCreator`,
        },
      ],
    },
    {
      id: "twitter",
      title: "Twitter Posts",
      description: "Generate Twitter threads and individual tweets",
      icon: Twitter,
      items: [
        {
          id: 1,
          type: "thread",
          content: `Why voice technology is the next big business disruptor 🧵

We're witnessing a fundamental shift in how businesses handle information. Voice technology isn't just a trend—it's becoming essential infrastructure. (1/7)`,
        },
        {
          id: 2,
          type: "thread",
          content: `The numbers speak for themselves:
• 70% productivity increase
• 80% reduction in transcription costs  
• 50% faster content creation
• Universal accessibility benefits (2/7)`,
        },
        {
          id: 3,
          type: "thread",
          content: `Traditional workflows looked like this:
Record → Manual transcription → Edit → Create content → Publish

New voice-first workflow:
Speak → Instant transcription → AI content generation → Multi-format output (3/7)`,
        },
        {
          id: 4,
          type: "thread",
          content: `The real game-changer? Voice removes the friction between ideas and execution. No more "I'll write that down later" moments that never happen. (4/7)`,
        },
        {
          id: 5,
          type: "thread",
          content: `Accessibility wins: Voice technology opens doors for:
• Non-native speakers
• Users with motor disabilities  
• People who think better out loud
• Anyone who prefers speaking to typing (5/7)`,
        },
        {
          id: 6,
          type: "thread",
          content: `Cost impact is massive. Companies spending $1000s on transcription services can now get better results for a fraction of the cost. (6/7)`,
        },
        {
          id: 7,
          type: "thread",
          content: `The future belongs to businesses that can move from idea to content at the speed of speech. Are you ready to make the leap? 🚀 (7/7)`,
        },
        {
          id: 8,
          type: "single",
          content: `🎙️ Voice technology isn't replacing writers—it's amplifying human creativity. Speak your ideas, let AI handle the formatting. Focus on what matters: your unique perspective and insights.`,
        },
        {
          id: 9,
          type: "single",
          content: `The best content creators of 2024 will be those who master voice-to-content workflows. Why type when you can speak and get better results faster?`,
        },
        {
          id: 10,
          type: "single",
          content: `Just spent 5 minutes speaking and got a full blog post, social media content, and key talking points. The future of content creation is here and it's incredible 🤯`,
        },
      ],
    },
    {
      id: "keypoints",
      title: "Key Points",
      description: "Extract main ideas and bullet points",
      icon: Lightbulb,
      items: [
        {
          id: 1,
          content: `## Main Topics Discussed

### Technology Innovation
• Voice technology is transforming business operations
• AI-powered transcription services are becoming mainstream
• Integration of voice interfaces improves accessibility
• Cost-effective solutions for content generation

### Business Impact
• 70% increase in productivity through automation
• Significant reduction in manual transcription costs
• Streamlined workflows from idea to published content
• Enhanced accessibility for diverse user groups

### Key Benefits
• **Speed**: Convert speech to multiple content formats instantly
• **Cost**: Reduce operational expenses through automation  
• **Accessibility**: Universal design principles implementation
• **Scalability**: Handle large volumes of content efficiently

### Future Considerations
• Continuous evolution of voice technology capabilities
• Integration with existing business systems
• Training requirements for team adoption
• ROI measurement and optimization strategies

### Action Items
• Evaluate current content creation processes
• Research voice technology solutions
• Pilot test with small team or project
• Measure productivity improvements
• Scale successful implementations

### Critical Success Factors
• User adoption and training
• Quality of voice recognition technology
• Integration with existing tools
• Clear ROI metrics and goals`,
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

  const renderTwitterPost = (item: ContentItem) => {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-gray-900">Your Business</h4>
                <span className="text-blue-500">✓</span>
                <span className="text-gray-500 text-sm">@yourbusiness</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-sm">2h</span>
              </div>
              <div className="mt-2 text-gray-900 whitespace-pre-wrap leading-relaxed">
                {item.content}
              </div>
              <div className="flex items-center justify-between mt-3 max-w-md">
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
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInstagramPost = (item: ContentItem) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg max-w-md mx-auto">
        {/* Instagram Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 rounded-full p-0.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="text-xs font-bold bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  U
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm">yourbusiness</h4>
              <p className="text-xs text-gray-500">Sponsored</p>
            </div>
          </div>
          <button className="text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Instagram Image Placeholder */}
        <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-600 text-sm font-medium">
              Voice Tech Innovation
            </p>
          </div>
        </div>

        {/* Instagram Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Heart className="h-6 w-6 text-gray-700 hover:text-red-500 cursor-pointer" />
              <MessageCircle className="h-6 w-6 text-gray-700 cursor-pointer" />
              <Share className="h-6 w-6 text-gray-700 cursor-pointer" />
            </div>
            <Bookmark className="h-6 w-6 text-gray-700 cursor-pointer" />
          </div>

          <div className="text-sm">
            <p className="font-semibold mb-1">127 likes</p>
            <div className="text-gray-900">
              <span className="font-semibold">yourbusiness</span>{" "}
              <span className="whitespace-pre-wrap">{item.content}</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">2 HOURS AGO</p>
          </div>
        </div>
      </div>
    );
  };

  const renderBlogPost = (item: ContentItem) => {
    const content = item.content;
    const sections = content.split("\n\n");
    const title = sections[0].replace("# ", "");
    const restContent = sections.slice(1).join("\n\n");

    return (
      <div className="max-w-4xl mx-auto">
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Blog Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-8 border-b border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Your Business Blog
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>324 views</span>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
          </div>

          {/* Blog Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="blog-content text-gray-800 leading-relaxed">
                {restContent.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-emerald-200"
                      >
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  } else if (paragraph.startsWith("### ")) {
                    return (
                      <h3
                        key={index}
                        className="text-xl font-semibold text-gray-800 mt-6 mb-3 flex items-center"
                      >
                        <div className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></div>
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  } else {
                    return (
                      <p
                        key={index}
                        className="text-gray-700 mb-4 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    );
                  }
                })}
              </div>
            </div>
          </div>

          {/* Blog Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">24 likes</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">8 comments</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Share className="h-5 w-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>#VoiceTech</span>
                <span>#BusinessInnovation</span>
                <span>#AI</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  };

  const renderKeyPoints = (item: ContentItem) => {
    const content = item.content;
    const sections = content.split("\n\n");

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Key Insights & Takeaways
                </h2>
                <p className="text-gray-600">
                  Essential points from your audio content
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {sections.map((section, sectionIndex) => {
              const lines = section.split("\n").filter((line) => line.trim());
              if (!lines.length) return null;

              const title = lines[0].replace(/^##?\s*/, "");
              const items = lines
                .slice(1)
                .filter((line) => line.startsWith("•"));

              return (
                <div
                  key={sectionIndex}
                  className="bg-gray-50 rounded-lg p-5 border-l-4 border-emerald-500"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {sectionIndex === 0 && (
                        <Target className="h-6 w-6 text-emerald-600 mt-1" />
                      )}
                      {sectionIndex === 1 && (
                        <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                      )}
                      {sectionIndex === 2 && (
                        <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                      )}
                      {sectionIndex === 3 && (
                        <Eye className="h-6 w-6 text-purple-600 mt-1" />
                      )}
                      {sectionIndex === 4 && (
                        <Lightbulb className="h-6 w-6 text-yellow-600 mt-1" />
                      )}
                      {sectionIndex >= 5 && (
                        <CheckCircle2 className="h-6 w-6 text-gray-600 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {title}
                      </h3>
                      <div className="space-y-2">
                        {items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-start space-x-3"
                          >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700 leading-relaxed">
                              {item
                                .replace("• ", "")
                                .replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>"
                                )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="bg-emerald-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-800 font-medium">
                  {sections.filter((s) => s.trim()).length} key sections
                  identified
                </span>
              </div>
              <div className="text-sm text-emerald-600 font-medium">
                Ready for implementation
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {activeContent && (
                    <>
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <activeContent.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {activeContent.title}
                          {hasMultipleItems && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              ({currentItemIndex + 1} of{" "}
                              {activeContent.items.length})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Generated from your audio transcript
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {hasMultipleItems && (
                    <div className="flex items-center space-x-1 mr-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentItemIndex(Math.max(0, currentItemIndex - 1))
                        }
                        disabled={currentItemIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentItemIndex(
                            Math.min(
                              (activeContent?.items.length || 1) - 1,
                              currentItemIndex + 1
                            )
                          )
                        }
                        disabled={
                          currentItemIndex ===
                          (activeContent?.items.length || 1) - 1
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
                      {copiedContent === activeContent?.id ? "Copied!" : "Copy"}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      currentItem &&
                      handleDownloadContent(
                        currentItem.content,
                        activeContent?.title || ""
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {currentItem && (
                <div className="h-full">
                  {activeTab === "twitter" && renderTwitterPost(currentItem)}
                  {activeTab === "instagram" &&
                    renderInstagramPost(currentItem)}
                  {activeTab === "blog" && renderBlogPost(currentItem)}
                  {activeTab === "keypoints" && renderKeyPoints(currentItem)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
