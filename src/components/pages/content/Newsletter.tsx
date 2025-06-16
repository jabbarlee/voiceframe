"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import {
  Edit3,
  Mail,
  Monitor,
  Smartphone,
  Eye,
  AlertTriangle,
  CheckCircle,
  Settings,
  Hash,
  ExternalLink,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Newsletter {
  id: string;
  subjectLine: string;
  preheaderText: string;
  greeting: string;
  mainContent: string;
  callToAction: string;
  footer: string;
  personalizationTokens: string[];
  subjectLineVariants: string[];
  spamScore: number;
  estimatedOpenRate: string;
}

interface NewsletterProps {
  initialContent: string;
}

export interface NewsletterRef {
  exportAsText: () => void;
  copyAsText: () => Promise<void>;
  exportAsCSV: () => void;
  addQuestion: () => void;
  addHashtags: () => void;
  addCTA: () => void;
}

export const Newsletter = forwardRef<NewsletterRef, NewsletterProps>(
  ({ initialContent }, ref) => {
    // Parse initial content into newsletter format
    const parseInitialNewsletter = (content: string): Newsletter => {
      const sections = content
        .split("\n\n")
        .filter((section) => section.trim());

      const subjectLine = "🚀 Transform Your Business with Voice Technology";
      const preheaderText =
        "Discover how leading companies are increasing productivity by 70%";
      const mainContent = sections.join("\n\n");

      // Generate subject line variants
      const subjectVariants = [
        "Voice Technology: The Business Game-Changer You Can't Ignore",
        "How Smart Companies Are Using Voice Tech to Boost Productivity 70%",
        "The Future of Work is Here: Voice Technology Revolution",
        "Why Your Competitors Are Already Using Voice Technology",
        "Exclusive: Voice Tech Success Stories from Industry Leaders",
      ];

      return {
        id: "newsletter-1",
        subjectLine,
        preheaderText,
        greeting: "Hi {FirstName},",
        mainContent,
        callToAction:
          "Ready to revolutionize your workflow? Get started with voice technology today and join thousands of businesses already seeing results.",
        footer:
          "You're receiving this email because you subscribed to VoiceFrame updates. Unsubscribe anytime.",
        personalizationTokens: ["{FirstName}", "{CompanyName}", "{Industry}"],
        subjectLineVariants: subjectVariants,
        spamScore: 2.1, // Low spam score
        estimatedOpenRate: "24-28%",
      };
    };

    const [newsletter, setNewsletter] = useState<Newsletter>(
      parseInitialNewsletter(initialContent)
    );
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [previewClient, setPreviewClient] = useState<
      "gmail" | "outlook" | "mobile"
    >("gmail");
    const [activeTab, setActiveTab] = useState<"edit" | "preview" | "optimize">(
      "edit"
    );

    const updateNewsletter = (field: keyof Newsletter, value: any) => {
      setNewsletter((prev) => ({ ...prev, [field]: value }));
    };

    // Export functions
    const exportAsText = () => {
      const content = `Subject: ${newsletter.subjectLine}\nPreheader: ${newsletter.preheaderText}\n\n${newsletter.greeting}\n\n${newsletter.mainContent}\n\n${newsletter.callToAction}\n\n---\n${newsletter.footer}`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "newsletter.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const copyAsText = async () => {
      const content = `${newsletter.subjectLine}\n\n${newsletter.greeting}\n\n${newsletter.mainContent}\n\n${newsletter.callToAction}`;

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
        `"Subject Line","${newsletter.subjectLine.replace(/"/g, '""')}"`,
        `"Preheader","${newsletter.preheaderText.replace(/"/g, '""')}"`,
        `"Greeting","${newsletter.greeting.replace(/"/g, '""')}"`,
        `"Main Content","${newsletter.mainContent.replace(/"/g, '""')}"`,
        `"CTA","${newsletter.callToAction.replace(/"/g, '""')}"`,
        `"Footer","${newsletter.footer.replace(/"/g, '""')}"`,
        `"Spam Score","${newsletter.spamScore}"`,
        `"Est. Open Rate","${newsletter.estimatedOpenRate}"`,
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "newsletter.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Enhancement functions
    const addQuestion = () => {
      updateNewsletter(
        "mainContent",
        newsletter.mainContent +
          "\n\nWhat challenges is your organization facing with current workflows? Reply and let us know - we read every response!"
      );
    };

    const addHashtags = () => {
      updateNewsletter(
        "mainContent",
        newsletter.mainContent +
          "\n\n#VoiceTechnology #BusinessInnovation #ProductivityBoost #DigitalTransformation"
      );
    };

    const addCTA = () => {
      updateNewsletter(
        "callToAction",
        newsletter.callToAction +
          "\n\n[Get Free Demo] or reply to this email with questions - our team responds within 24 hours."
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

    const getSpamWarnings = () => {
      const warnings = [];
      if (newsletter.subjectLine.includes("!"))
        warnings.push("Exclamation marks in subject line");
      if (newsletter.subjectLine.toLowerCase().includes("free"))
        warnings.push('Uses "free" in subject line');
      if (newsletter.mainContent.toUpperCase() === newsletter.mainContent)
        warnings.push("All caps content detected");
      return warnings;
    };

    const renderEmailPreview = () => {
      const baseClasses =
        "bg-white border border-gray-200 rounded-lg overflow-hidden";

      if (previewClient === "gmail") {
        return (
          <div className={`${baseClasses} max-w-full`}>
            {/* Gmail Header */}
            <div className="bg-gray-100 p-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">
                      VoiceFrame Team
                    </span>
                    <span className="text-xs text-gray-500">
                      hello@voiceframe.com
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">to me</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {/* Subject & Preheader */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {newsletter.subjectLine}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {newsletter.preheaderText}
              </p>
            </div>

            {/* Email Content */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-800">{newsletter.greeting}</p>
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {newsletter.mainContent}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                  <p className="text-blue-800 font-medium">
                    {newsletter.callToAction}
                  </p>
                  <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                    Get Started Today
                  </Button>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <p className="text-xs text-gray-500">{newsletter.footer}</p>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (previewClient === "outlook") {
        return (
          <div className={`${baseClasses} max-w-full`}>
            {/* Outlook Header */}
            <div className="bg-blue-600 text-white p-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" />
                <span className="font-semibold">Microsoft Outlook</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 border-b border-gray-200">
              <div className="text-sm">
                <div className="font-semibold">{newsletter.subjectLine}</div>
                <div className="text-gray-600">
                  VoiceFrame Team &lt;hello@voiceframe.com&gt;
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-6 bg-white">
              <div className="space-y-4">
                <p className="text-gray-800">{newsletter.greeting}</p>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {newsletter.mainContent}
                </div>
                <div className="bg-gray-100 border-l-4 border-blue-500 p-4 my-6">
                  <p className="text-gray-800">{newsletter.callToAction}</p>
                  <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                    Get Started Today
                  </Button>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <p className="text-xs text-gray-500">{newsletter.footer}</p>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className={`${baseClasses} max-w-sm mx-auto`}>
            {/* Mobile Header */}
            <div className="bg-gray-900 text-white p-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium truncate">
                  {newsletter.subjectLine}
                </span>
              </div>
              <div className="text-xs text-gray-300 mt-1">VoiceFrame Team</div>
            </div>

            {/* Email Content */}
            <div className="p-4 text-sm">
              <div className="space-y-3">
                <p className="text-gray-800">{newsletter.greeting}</p>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {newsletter.mainContent.substring(0, 200)}...
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-blue-800 text-sm">
                    {newsletter.callToAction.substring(0, 100)}...
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </Button>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-4">
                  <p className="text-xs text-gray-500">
                    {newsletter.footer.substring(0, 80)}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    };

    const renderEditTab = () => (
      <div className="space-y-6">
        {/* Subject Line & Preheader */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-purple-600" />
            Email Headers
          </h3>

          <div className="space-y-4">
            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line{" "}
                <span className="text-gray-500">
                  ({newsletter.subjectLine.length}/50 optimal)
                </span>
              </label>
              {editingSection === "subject" ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newsletter.subjectLine}
                    onChange={(e) =>
                      updateNewsletter("subjectLine", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter compelling subject line"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setEditingSection(null)}
                      className="bg-purple-600 hover:bg-purple-700"
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
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <span className="font-medium">{newsletter.subjectLine}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSection("subject")}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Preheader */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preheader Text{" "}
                <span className="text-gray-500">
                  ({newsletter.preheaderText.length}/90 optimal)
                </span>
              </label>
              {editingSection === "preheader" ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newsletter.preheaderText}
                    onChange={(e) =>
                      updateNewsletter("preheaderText", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Preview text that appears after subject line"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setEditingSection(null)}
                      className="bg-purple-600 hover:bg-purple-700"
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
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <span className="text-gray-600">
                    {newsletter.preheaderText}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSection("preheader")}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Email Content
          </h3>

          {editingSection === "content" ? (
            <div className="space-y-4">
              <textarea
                value={newsletter.mainContent}
                onChange={(e) =>
                  updateNewsletter("mainContent", e.target.value)
                }
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Write your newsletter content here..."
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setEditingSection(null)}
                  className="bg-purple-600 hover:bg-purple-700"
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
              <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 min-h-[200px]">
                {newsletter.mainContent}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingSection("content")}
                className="absolute top-2 right-2"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );

    const renderPreviewTab = () => (
      <div className="space-y-6">
        {/* Preview Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Email Preview
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={previewClient === "gmail" ? "default" : "outline"}
                onClick={() => setPreviewClient("gmail")}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Gmail
              </Button>
              <Button
                size="sm"
                variant={previewClient === "outlook" ? "default" : "outline"}
                onClick={() => setPreviewClient("outlook")}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Outlook
              </Button>
              <Button
                size="sm"
                variant={previewClient === "mobile" ? "default" : "outline"}
                onClick={() => setPreviewClient("mobile")}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </Button>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          {renderEmailPreview()}
        </div>
      </div>
    );

    const renderOptimizeTab = () => (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Performance Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-semibold">
                Estimated Open Rate
              </div>
              <div className="text-2xl font-bold text-green-700">
                {newsletter.estimatedOpenRate}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 font-semibold">Spam Score</div>
              <div className="text-2xl font-bold text-blue-700">
                {newsletter.spamScore}/10
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-purple-800 font-semibold">
                Subject Length
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {newsletter.subjectLine.length}
              </div>
            </div>
          </div>
        </div>

        {/* Subject Line Variants */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-semibold text-yellow-900 mb-4 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI-Generated Subject Line Variants
          </h4>

          <div className="space-y-3">
            {newsletter.subjectLineVariants.map((variant, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-yellow-200"
              >
                <span className="text-gray-700 flex-1 mr-4">{variant}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateNewsletter("subjectLine", variant)}
                >
                  Use This
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Spam Check */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h4 className="font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Spam Compliance Check
          </h4>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 ${
                  newsletter.spamScore <= 3 ? "text-green-700" : "text-red-700"
                }`}
              >
                {newsletter.spamScore <= 3 ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  Spam Score: {newsletter.spamScore}/10
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {newsletter.spamScore <= 3
                  ? "Good - Low spam risk"
                  : "Warning - High spam risk"}
              </span>
            </div>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-800 mb-2">
                Personalization Tokens:
              </h5>
              <div className="flex flex-wrap gap-2">
                {newsletter.personalizationTokens.map((token, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Newsletter Editor
              </h2>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "edit"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Edit3 className="h-4 w-4 inline mr-2" />
              Edit Content
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab("optimize")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "optimize"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Target className="h-4 w-4 inline mr-2" />
              Optimize
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "edit" && renderEditTab()}
        {activeTab === "preview" && renderPreviewTab()}
        {activeTab === "optimize" && renderOptimizeTab()}

        {/* Export Options - Always Visible */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export & Integration
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button size="sm" variant="outline" disabled>
              HTML Export
            </Button>
            <Button size="sm" variant="outline" disabled>
              Mailchimp
            </Button>
            <Button size="sm" variant="outline" disabled>
              Substack
            </Button>
            <Button size="sm" variant="outline" disabled>
              ConvertKit
            </Button>
            <Button size="sm" variant="outline" disabled>
              Campaign Monitor
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

Newsletter.displayName = "Newsletter";
