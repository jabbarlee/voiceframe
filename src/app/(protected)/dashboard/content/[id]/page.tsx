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
  Linkedin,
  Lightbulb,
  Hash,
  MessageSquare,
  ExternalLink,
  BookOpen,
  Newspaper,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TwitterThreads,
  TwitterThreadsRef,
} from "@/components/pages/content/TwitterThreads";
import {
  LinkedInPosts,
  LinkedInPostsRef,
} from "@/components/pages/content/LinkedInPosts";
import { BlogPosts, BlogPostsRef } from "@/components/pages/content/BlogPosts";
import { Articles, ArticlesRef } from "@/components/pages/content/Articles";
import {
  Newsletter,
  NewsletterRef,
} from "@/components/pages/content/Newsletter";

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
  const linkedInPostsRef = useRef<LinkedInPostsRef>(null);
  const blogPostsRef = useRef<BlogPostsRef>(null);
  const articlesRef = useRef<ArticlesRef>(null);
  const newsletterRef = useRef<NewsletterRef>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showEnhancementsMenu, setShowEnhancementsMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Content types with all five content types
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
    {
      id: "linkedin",
      title: "LinkedIn Posts",
      description: "Professional content for thought leadership and networking",
      icon: Linkedin,
      items: [
        {
          id: 1,
          content: `The business landscape is transforming at unprecedented speed, and voice technology is at the forefront of this revolution.

Having worked with dozens of companies implementing voice-first strategies, I've witnessed remarkable transformations. Organizations that embrace this technology aren't just improving efficiency—they're fundamentally reimagining how work gets done.

Consider these compelling statistics:
→ 70% productivity increase across departments
→ 80% reduction in transcription costs
→ 50% faster content creation cycles
→ Universal accessibility improvements

But here's what the data doesn't capture: the human impact. Teams become more engaged in meetings because they're not frantically taking notes. Ideas flow more freely because the barrier between thought and documentation virtually disappears. Non-native speakers gain confidence because they can express themselves naturally.

The traditional workflow—recording, manual transcription, editing, formatting, and distribution—now occur seamlessly through integrated voice-first workflows.

This isn't just about technology adoption; it's about competitive advantage. Companies that can move from idea to execution at the speed of speech will dominate their markets.

The question isn't whether voice technology will transform your industry—it's whether you'll lead that transformation or scramble to catch up.`,
        },
      ],
    },
    {
      id: "blog",
      title: "Blog Posts",
      description:
        "Structured blog posts with SEO optimization and WYSIWYG editing",
      icon: BookOpen,
      items: [
        {
          id: 1,
          content: `# The Future of Voice Technology in Business

In today's rapidly evolving digital landscape, voice technology has emerged as a transformative force that's reshaping how businesses operate and communicate. From automated transcription services to AI-powered content generation, the possibilities are endless.

## Key Benefits of Voice Technology

### Enhanced Productivity
Voice technology significantly reduces the time spent on manual tasks like note-taking and content creation. By converting spoken words into text and then into various content formats, businesses can streamline their workflows and focus on higher-value activities.

### Improved Accessibility
Voice interfaces make technology more accessible to users with different abilities and preferences. This inclusivity not only expands your potential audience but also demonstrates a commitment to universal design principles.

### Cost-Effective Solutions
Implementing voice technology can lead to substantial cost savings through automation of repetitive tasks and reduced need for manual transcription services.

## The Road Ahead

As we look to the future, voice technology will continue to evolve, offering even more sophisticated capabilities. Businesses that embrace these innovations today will be well-positioned to leverage tomorrow's advancements.

The integration of voice technology isn't just about keeping up with trends—it's about reimagining how we work, communicate, and create value in an increasingly connected world.`,
        },
      ],
    },
    {
      id: "article",
      title: "Articles",
      description:
        "Journalistic articles with fact-checking and citation features",
      icon: Newspaper,
      items: [
        {
          id: 1,
          content: `Voice Technology Revolutionizes Business Operations Across Industries

Leading organizations report unprecedented productivity gains following implementation of AI-powered voice solutions, marking a significant shift in workplace efficiency standards.

Recent industry analysis reveals that companies implementing voice technology solutions have experienced remarkable operational improvements. The transformation extends beyond simple transcription services to encompass comprehensive workflow automation and enhanced accessibility features.

"We've seen a complete transformation in how our teams collaborate," said Sarah Johnson, Chief Technology Officer at TechCorp. "The barrier between idea and execution has virtually disappeared."

The data supports these qualitative observations. Organizations utilizing voice technology report:

- 70% reduction in documentation time
- 80% decrease in transcription costs  
- 50% improvement in meeting efficiency
- Universal accessibility compliance achievements

Traditional business processes that once required multiple steps—recording, manual transcription, editing, formatting, and distribution—now occur seamlessly through integrated voice-first workflows.

Industry experts predict this trend will accelerate as artificial intelligence capabilities continue advancing. The technology represents more than operational efficiency; it fundamentally reimagines how knowledge workers interact with information systems.

"This isn't just about technology adoption," noted Dr. Maria Rodriguez, Director of Digital Transformation Research at Innovation Institute. "We're witnessing a fundamental shift in workplace dynamics that prioritizes human creativity over manual processing."

The implications extend to workforce development, with organizations reporting improved employee satisfaction and retention rates. Teams previously burdened with documentation tasks now focus on strategic initiatives and creative problem-solving.

As voice technology becomes increasingly sophisticated, early adopters position themselves advantageously for continued innovation cycles. The question for business leaders becomes not whether to implement these solutions, but how quickly they can integrate them effectively.`,
        },
      ],
    },
    {
      id: "newsletter",
      title: "Newsletter Format",
      description:
        "Email marketing newsletters with client previews and spam checking",
      icon: Mail,
      items: [
        {
          id: 1,
          content: `Welcome to the Voice Technology Revolution

The business world is experiencing a fundamental transformation, and voice technology sits at the epicenter of this change. What started as a convenience feature has evolved into mission-critical infrastructure that's reshaping how organizations operate, communicate, and compete.

In recent months, we've witnessed unprecedented adoption rates across industries. From startups to Fortune 500 companies, organizations are discovering that voice technology isn't just about transcription—it's about reimagining entire workflows and unlocking human potential.

Here's what the latest research reveals:

Companies implementing voice-first strategies report average productivity increases of 70%. This isn't just about faster typing—it's about removing friction between ideas and execution. Teams can now capture thoughts, generate content, and iterate on concepts at the speed of speech.

The accessibility benefits are equally compelling. Voice technology democratizes communication, opening doors for team members with different abilities, non-native speakers, and those who simply think better out loud. One client recently told us their brainstorming sessions became 40% more inclusive after implementing voice tools.

But perhaps most importantly, this technology is proving its worth in the most demanding environments. During high-stakes meetings, critical decision-making sessions, and time-sensitive projects, voice technology ensures nothing gets lost and everything gets captured with perfect accuracy.

The companies that embrace this transformation today will define tomorrow's competitive landscape. Those who wait risk falling behind as voice-first workflows become the new standard.

Are you ready to transform how your organization communicates and creates? The future is speaking—and it's time to listen.`,
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

  // LinkedIn-specific export functions
  const handleLinkedInCopyAsText = async () => {
    try {
      await linkedInPostsRef.current?.copyAsText();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleLinkedInExportAsText = () => {
    linkedInPostsRef.current?.exportAsText();
    setShowDownloadMenu(false);
  };

  const handleLinkedInExportAsCSV = () => {
    linkedInPostsRef.current?.exportAsCSV();
    setShowDownloadMenu(false);
  };

  // Blog-specific export functions
  const handleBlogCopyAsText = async () => {
    try {
      await blogPostsRef.current?.copyAsText();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleBlogExportAsText = () => {
    blogPostsRef.current?.exportAsText();
    setShowDownloadMenu(false);
  };

  const handleBlogExportAsCSV = () => {
    blogPostsRef.current?.exportAsCSV();
    setShowDownloadMenu(false);
  };

  // Article-specific export functions
  const handleArticleCopyAsText = async () => {
    try {
      await articlesRef.current?.copyAsText();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleArticleExportAsText = () => {
    articlesRef.current?.exportAsText();
    setShowDownloadMenu(false);
  };

  const handleArticleExportAsCSV = () => {
    articlesRef.current?.exportAsCSV();
    setShowDownloadMenu(false);
  };

  // Newsletter-specific export functions
  const handleNewsletterCopyAsText = async () => {
    try {
      await newsletterRef.current?.copyAsText();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleNewsletterExportAsText = () => {
    newsletterRef.current?.exportAsText();
    setShowDownloadMenu(false);
  };

  const handleNewsletterExportAsCSV = () => {
    newsletterRef.current?.exportAsCSV();
    setShowDownloadMenu(false);
  };

  // Quick enhancement functions
  const handleAddQuestion = () => {
    if (activeTab === "twitter") {
      // Add question to current tweet being edited or last tweet
      twitterThreadsRef.current?.addQuestion?.();
    } else if (activeTab === "linkedin") {
      linkedInPostsRef.current?.addQuestion?.();
    } else if (activeTab === "blog") {
      blogPostsRef.current?.addQuestion?.();
    } else if (activeTab === "article") {
      articlesRef.current?.addQuestion?.();
    } else if (activeTab === "newsletter") {
      newsletterRef.current?.addQuestion?.();
    }
    setShowEnhancementsMenu(false);
  };

  const handleAddHashtags = () => {
    if (activeTab === "twitter") {
      twitterThreadsRef.current?.addHashtags?.();
    } else if (activeTab === "linkedin") {
      linkedInPostsRef.current?.addHashtags?.();
    } else if (activeTab === "blog") {
      blogPostsRef.current?.addHashtags?.();
    } else if (activeTab === "article") {
      articlesRef.current?.addHashtags?.();
    } else if (activeTab === "newsletter") {
      newsletterRef.current?.addHashtags?.();
    }
    setShowEnhancementsMenu(false);
  };

  const handleAddCTA = () => {
    if (activeTab === "twitter") {
      twitterThreadsRef.current?.addCTA?.();
    } else if (activeTab === "linkedin") {
      linkedInPostsRef.current?.addCTA?.();
    } else if (activeTab === "blog") {
      blogPostsRef.current?.addCTA?.();
    } else if (activeTab === "article") {
      articlesRef.current?.addCTA?.();
    } else if (activeTab === "newsletter") {
      newsletterRef.current?.addCTA?.();
    }
    setShowEnhancementsMenu(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadMenu || showEnhancementsMenu) {
        setShowDownloadMenu(false);
        setShowEnhancementsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDownloadMenu, showEnhancementsMenu]);

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
                      {/* Quick Enhancements Button */}
                      {(activeTab === "twitter" ||
                        activeTab === "linkedin" ||
                        activeTab === "blog" ||
                        activeTab === "article" ||
                        activeTab === "newsletter") && (
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setShowEnhancementsMenu(!showEnhancementsMenu)
                            }
                            className="flex items-center space-x-2"
                          >
                            <Lightbulb className="h-4 w-4" />
                            <span>Enhance</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>

                          {/* Quick Enhancements Dropdown */}
                          {showEnhancementsMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <div className="py-2">
                                <button
                                  onClick={handleAddQuestion}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span>Add Question</span>
                                </button>
                                <button
                                  onClick={handleAddHashtags}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Hash className="h-4 w-4" />
                                  <span>Add Hashtags</span>
                                </button>
                                <button
                                  onClick={handleAddCTA}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span>Add Call-to-Action</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  disabled
                                  className="w-full px-4 py-2 text-left text-gray-400 flex items-center space-x-2 cursor-not-allowed"
                                >
                                  <span className="text-xs">
                                    Platform Integration (Soon)
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Download Button with Dropdown */}
                      <div className="relative">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (
                              activeTab === "twitter" ||
                              activeTab === "linkedin" ||
                              activeTab === "blog" ||
                              activeTab === "article" ||
                              activeTab === "newsletter"
                            ) {
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
                          {(activeTab === "twitter" ||
                            activeTab === "linkedin" ||
                            activeTab === "blog" ||
                            activeTab === "article" ||
                            activeTab === "newsletter") && (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Download Dropdown */}
                        {(activeTab === "twitter" ||
                          activeTab === "linkedin" ||
                          activeTab === "blog" ||
                          activeTab === "article" ||
                          activeTab === "newsletter") &&
                          showDownloadMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <div className="py-2">
                                <button
                                  onClick={() => {
                                    if (activeTab === "twitter")
                                      handleTwitterCopyAsText();
                                    else if (activeTab === "linkedin")
                                      handleLinkedInCopyAsText();
                                    else if (activeTab === "blog")
                                      handleBlogCopyAsText();
                                    else if (activeTab === "article")
                                      handleArticleCopyAsText();
                                    else if (activeTab === "newsletter")
                                      handleNewsletterCopyAsText();
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span>
                                    {copySuccess ? "Copied!" : "Copy as Text"}
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (activeTab === "twitter")
                                      handleTwitterExportAsText();
                                    else if (activeTab === "linkedin")
                                      handleLinkedInExportAsText();
                                    else if (activeTab === "blog")
                                      handleBlogExportAsText();
                                    else if (activeTab === "article")
                                      handleArticleExportAsText();
                                    else if (activeTab === "newsletter")
                                      handleNewsletterExportAsText();
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download as Text</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (activeTab === "twitter")
                                      handleTwitterExportAsCSV();
                                    else if (activeTab === "linkedin")
                                      handleLinkedInExportAsCSV();
                                    else if (activeTab === "blog")
                                      handleBlogExportAsCSV();
                                    else if (activeTab === "article")
                                      handleArticleExportAsCSV();
                                    else if (activeTab === "newsletter")
                                      handleNewsletterExportAsCSV();
                                  }}
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
                      {activeTab === "linkedin" && (
                        <LinkedInPosts
                          ref={linkedInPostsRef}
                          initialContent={currentItem.content}
                        />
                      )}
                      {activeTab === "blog" && (
                        <BlogPosts
                          ref={blogPostsRef}
                          initialContent={currentItem.content}
                        />
                      )}
                      {activeTab === "article" && (
                        <Articles
                          ref={articlesRef}
                          initialContent={currentItem.content}
                        />
                      )}
                      {activeTab === "newsletter" && (
                        <Newsletter
                          ref={newsletterRef}
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
