"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Add type definitions
type SummaryTone = "professional" | "friendly" | "eli5";

// Sample boilerplate data
const sampleData = {
  audioTitle: "Introduction to Machine Learning - Lecture 1",
  duration: "45 minutes",
  processedAt: "2024-01-15T10:30:00Z",

  summary: {
    professional: {
      title: "Introduction to Machine Learning - Comprehensive Overview",
      sections: [
        {
          heading: "Core Definition and Paradigm Shift",
          content:
            "**Machine Learning** represents a paradigm shift in computational problem-solving, where systems learn patterns from data rather than following explicit programming instructions. This foundational lecture establishes the theoretical framework for understanding supervised, unsupervised, and reinforcement learning methodologies.",
        },
        {
          heading: "Primary Objectives",
          content:
            "The primary objective of machine learning is to develop **algorithms that can automatically improve their performance through experience**. Key applications include:\n\n• **Pattern recognition** - Identifying complex patterns in data\n• **Predictive analytics** - Forecasting future trends and behaviors\n• **Autonomous decision-making systems** - Automated systems across various domains\n\nThese applications span across healthcare, finance, and technology sectors.",
        },
        {
          heading: "Fundamental Concepts",
          content:
            "Essential concepts covered in this session include:\n\n• **Training datasets** - Core data used to teach algorithms\n• **Feature engineering** - Process of selecting and transforming input variables\n• **Model validation** - Techniques to assess model performance\n• **Bias-variance tradeoff** - Fundamental balance in model complexity\n\nUnderstanding these principles is **crucial for implementing effective machine learning solutions** in real-world scenarios.",
        },
      ],
    },

    friendly: {
      title: "Welcome to the Exciting World of Machine Learning! 🤖",
      sections: [
        {
          heading: "What is Machine Learning?",
          content:
            "Think of **Machine Learning** as teaching computers to be smart by showing them lots of examples! It's just like how you learned to recognize cats by seeing many different cats over time.\n\nInstead of programming every single rule, we let computers **discover patterns on their own** - pretty cool, right?",
        },
        {
          heading: "The Three Superpowers of ML",
          content:
            "In today's session, we explored three amazing types of machine learning:\n\n🎓 **Supervised Learning** - Learning with a teacher helping\n🔍 **Unsupervised Learning** - Finding hidden patterns like a detective\n🎮 **Reinforcement Learning** - Learning through trial and error (like playing games!)\n\nEach type has its own **superpowers** for solving different kinds of problems!",
        },
        {
          heading: "Your Smart AI Assistant",
          content:
            "Machine learning is like having a **really smart assistant** that gets better at helping you the more examples you show it. The more data it sees, the smarter it becomes at making decisions and predictions!\n\nIt's all about **learning from experience** - just like humans do, but much faster! ⚡",
        },
      ],
    },

    eli5: {
      title: "Machine Learning for Beginners 🎯",
      sections: [
        {
          heading: "Teaching Computers Like Teaching Kids",
          content:
            'Imagine you\'re teaching your **little brother** to recognize different animals. You show him pictures and say:\n\n• *"This is a dog"* 🐕\n• *"This is a cat"* 🐱  \n• *"This is a bird"* 🐦\n\nAfter seeing lots of pictures, he starts recognizing animals **all by himself**!',
        },
        {
          heading: "That's Exactly What Machine Learning Does!",
          content:
            "We show computers lots of examples, and they learn to recognize patterns **all by themselves**. It's like magic, but it's actually **math**! 🎯\n\nThe computer becomes really good at spotting things it has seen before, just like your little brother with the animal pictures.",
        },
        {
          heading: "Three Ways Computers Learn",
          content:
            "There are **three main ways** computers can learn:\n\n1. 🎓 **With a teacher helping** them (like our animal example)\n2. 🔍 **By finding secret patterns** in pictures or data\n3. 🎮 **By trying things and learning from mistakes** (like learning to ride a bike!)\n\nEach way is perfect for different types of problems the computer needs to solve.",
        },
      ],
    },
  },

  flashcards: [
    {
      id: 1,
      question: "What is Machine Learning?",
      answer:
        "A subset of artificial intelligence that enables systems to automatically learn and improve from experience without being explicitly programmed for every task.",
    },
    {
      id: 2,
      question: "What are the three main types of Machine Learning?",
      answer:
        "1. Supervised Learning (learning with labeled data)\n2. Unsupervised Learning (finding patterns in unlabeled data)\n3. Reinforcement Learning (learning through rewards and penalties)",
    },
    {
      id: 3,
      question: "What is the bias-variance tradeoff?",
      answer:
        "A fundamental concept where bias refers to errors from oversimplifying assumptions, while variance refers to errors from sensitivity to small fluctuations. The goal is to minimize both for optimal model performance.",
    },
    {
      id: 4,
      question: "Define 'overfitting' in machine learning",
      answer:
        "When a model learns the training data too well, including noise and outliers, resulting in poor performance on new, unseen data.",
    },
    {
      id: 5,
      question: "What is feature engineering?",
      answer:
        "The process of selecting, modifying, or creating new features (input variables) from raw data to improve machine learning model performance.",
    },
  ],

  concepts: [
    {
      term: "Supervised Learning",
      definition:
        "A machine learning approach where the algorithm learns from labeled training data to make predictions on new, unseen data.",
      category: "Learning Types",
    },
    {
      term: "Training Dataset",
      definition:
        "A collection of data used to teach a machine learning algorithm, containing input features and their corresponding correct outputs.",
      category: "Data",
    },
    {
      term: "Algorithm",
      definition:
        "A set of rules or instructions that a machine learning model follows to make predictions or decisions based on input data.",
      category: "Core Concepts",
    },
    {
      term: "Cross-Validation",
      definition:
        "A technique used to assess how well a machine learning model generalizes to independent datasets by partitioning data into training and testing subsets.",
      category: "Validation",
    },
    {
      term: "Neural Network",
      definition:
        "A computational model inspired by biological neural networks, consisting of interconnected nodes that process and transmit information.",
      category: "Models",
    },
    {
      term: "Gradient Descent",
      definition:
        "An optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent.",
      category: "Optimization",
    },
  ],

  mindMap: {
    title: "Machine Learning Fundamentals",
    nodes: [
      {
        id: "root",
        label: "Machine Learning",
        level: 0,
        children: ["types", "process", "applications"],
      },
      {
        id: "types",
        label: "Learning Types",
        level: 1,
        parent: "root",
        children: ["supervised", "unsupervised", "reinforcement"],
      },
      {
        id: "supervised",
        label: "Supervised Learning",
        level: 2,
        parent: "types",
        children: ["classification", "regression"],
      },
      {
        id: "classification",
        label: "Classification",
        level: 3,
        parent: "supervised",
        description: "Predicting categories or classes",
      },
      {
        id: "regression",
        label: "Regression",
        level: 3,
        parent: "supervised",
        description: "Predicting continuous values",
      },
      {
        id: "unsupervised",
        label: "Unsupervised Learning",
        level: 2,
        parent: "types",
        children: ["clustering", "dimensionality"],
      },
      {
        id: "clustering",
        label: "Clustering",
        level: 3,
        parent: "unsupervised",
        description: "Grouping similar data points",
      },
      {
        id: "dimensionality",
        label: "Dimensionality Reduction",
        level: 3,
        parent: "unsupervised",
        description: "Reducing feature space complexity",
      },
      {
        id: "reinforcement",
        label: "Reinforcement Learning",
        level: 2,
        parent: "types",
        description: "Learning through trial and error with rewards",
      },
      {
        id: "process",
        label: "ML Process",
        level: 1,
        parent: "root",
        children: ["data", "training", "evaluation"],
      },
      {
        id: "data",
        label: "Data Collection",
        level: 2,
        parent: "process",
        description: "Gathering and preparing datasets",
      },
      {
        id: "training",
        label: "Model Training",
        level: 2,
        parent: "process",
        description: "Teaching algorithms with data",
      },
      {
        id: "evaluation",
        label: "Model Evaluation",
        level: 2,
        parent: "process",
        description: "Testing model performance",
      },
      {
        id: "applications",
        label: "Applications",
        level: 1,
        parent: "root",
        children: ["healthcare", "finance", "technology"],
      },
      {
        id: "healthcare",
        label: "Healthcare",
        level: 2,
        parent: "applications",
        description: "Medical diagnosis, drug discovery",
      },
      {
        id: "finance",
        label: "Finance",
        level: 2,
        parent: "applications",
        description: "Risk assessment, fraud detection",
      },
      {
        id: "technology",
        label: "Technology",
        level: 2,
        parent: "applications",
        description: "Recommendation systems, autonomous vehicles",
      },
    ],
  },
};

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
  const [expandedNodes, setExpandedNodes] = useState(new Set(["root"]));

  useEffect(() => {
    setTitle("Study Materials");
  }, [setTitle]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodesByLevel = (level: number) => {
    return sampleData.mindMap.nodes.filter((node) => node.level === level);
  };

  const getChildNodes = (parentId: string) => {
    return sampleData.mindMap.nodes.filter((node) => node.parent === parentId);
  };

  const uniqueCategories = [
    ...new Set(sampleData.concepts.map((c) => c.category)),
  ];

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % sampleData.flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex(
      (prev) =>
        (prev - 1 + sampleData.flashcards.length) % sampleData.flashcards.length
    );
    setShowAnswer(false);
  };

  const shuffleCards = () => {
    setCurrentCardIndex(
      Math.floor(Math.random() * sampleData.flashcards.length)
    );
    setShowAnswer(false);
  };

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
      id: "mindmap",
      icon: GitBranch,
      label: "Mind Map",
      description: "Visual knowledge structure",
      color: "orange",
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between h-10">
            {/* Left side - Back button */}
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            {/* Center - Progress Steps */}
            <div className="flex items-center space-x-8">
              {/* Step 1 - Completed */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-600">Upload</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex-1 h-px bg-emerald-300 min-w-[2.5rem]"></div>

              {/* Step 2 - Completed */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-600">Transcribe</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex-1 h-px bg-emerald-300 min-w-[2.5rem]"></div>

              {/* Step 3 - Current */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-full">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-600">
                    Generate Content
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export All</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Audio Info Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileAudio className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Source Audio</h3>
                <p className="text-sm text-gray-500">Generated content from</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {sampleData.audioTitle}
              </h4>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{sampleData.duration}</span>
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
                        ? `bg-${type.color}-50 border-${type.color}-200 shadow-sm`
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isActive ? `bg-${type.color}-100` : "bg-gray-200"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive
                              ? `text-${type.color}-600`
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            isActive
                              ? `text-${type.color}-900`
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
              {/* Summary Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
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
                          {sampleData.summary[summaryTone].title}
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{sampleData.duration}</span>
                          </span>
                          <span>•</span>
                          <span>Generated from audio transcription</span>
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="p-8">
                        <div className="prose prose-gray prose-lg max-w-none">
                          {sampleData.summary[summaryTone].sections.map(
                            (section, index) => (
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
              {/* Flashcards Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
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
                        {currentCardIndex + 1} of {sampleData.flashcards.length}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shuffleCards}
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
                        ((currentCardIndex + 1) /
                          sampleData.flashcards.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentCardIndex + 1) /
                            sampleData.flashcards.length) *
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
                              ? sampleData.flashcards[currentCardIndex].answer
                              : sampleData.flashcards[currentCardIndex]
                                  .question}
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
                    onClick={prevCard}
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2"
                    disabled={currentCardIndex === 0}
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
                    onClick={nextCard}
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2"
                    disabled={
                      currentCardIndex === sampleData.flashcards.length - 1
                    }
                  >
                    <span>Next</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Study Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      {sampleData.flashcards.length}
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
                      {sampleData.flashcards.length - currentCardIndex - 1}
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
              {/* Concepts Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Key Concepts
                      </h2>
                      <p className="text-sm text-gray-500">
                        {sampleData.concepts.length} essential terms and
                        definitions
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
                    {sampleData.concepts.map((concept, index) => (
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
                          <div className="ml-4 flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              {concept.category}
                            </span>
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
                        {sampleData.concepts.length}
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
                              sampleData.concepts.map((c) => c.category)
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

          {/* Mind Map Tab */}
          {activeTab === "mindmap" && (
            <div className="flex-1 flex flex-col h-full">
              {/* Mind Map Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <GitBranch className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Mind Map
                    </h2>
                    <p className="text-sm text-gray-500">
                      Interactive knowledge structure
                    </p>
                  </div>
                </div>
              </div>

              {/* Mind Map Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                <div className="max-w-4xl mx-auto">
                  <div className="space-y-4">
                    {/* Root Node */}
                    {getNodesByLevel(0).map((node) => (
                      <div key={node.id} className="space-y-3">
                        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg">
                          <div className="flex items-center space-x-3">
                            <GitBranch className="h-6 w-6" />
                            <span className="text-lg font-bold">
                              {node.label}
                            </span>
                          </div>
                        </div>

                        {/* Level 1 Nodes */}
                        <div className="ml-8 space-y-3">
                          {getChildNodes(node.id).map((level1Node) => (
                            <div key={level1Node.id} className="space-y-2">
                              <div
                                className="bg-white border-2 border-blue-200 p-4 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors shadow-sm"
                                onClick={() => toggleNode(level1Node.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <GitBranch className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="font-semibold text-blue-900">
                                      {level1Node.label}
                                    </span>
                                  </div>
                                  {level1Node.children &&
                                    (expandedNodes.has(level1Node.id) ? (
                                      <ChevronDown className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-blue-600" />
                                    ))}
                                </div>
                                {level1Node.description && (
                                  <p className="text-blue-700 text-sm mt-2 ml-11">
                                    {level1Node.description}
                                  </p>
                                )}
                              </div>

                              {/* Level 2 Nodes */}
                              {expandedNodes.has(level1Node.id) && (
                                <div className="ml-8 space-y-2">
                                  {getChildNodes(level1Node.id).map(
                                    (level2Node) => (
                                      <div
                                        key={level2Node.id}
                                        className="space-y-2"
                                      >
                                        <div
                                          className="bg-white border border-purple-200 p-3 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                                          onClick={() =>
                                            toggleNode(level2Node.id)
                                          }
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <div className="p-1.5 bg-purple-100 rounded">
                                                <GitBranch className="h-4 w-4 text-purple-600" />
                                              </div>
                                              <span className="font-medium text-purple-900">
                                                {level2Node.label}
                                              </span>
                                            </div>
                                            {level2Node.children &&
                                              (expandedNodes.has(
                                                level2Node.id
                                              ) ? (
                                                <ChevronDown className="h-4 w-4 text-purple-600" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4 text-purple-600" />
                                              ))}
                                          </div>
                                          {level2Node.description && (
                                            <p className="text-purple-700 text-sm mt-1 ml-7">
                                              {level2Node.description}
                                            </p>
                                          )}
                                        </div>

                                        {/* Level 3 Nodes */}
                                        {expandedNodes.has(level2Node.id) && (
                                          <div className="ml-6 space-y-1">
                                            {getChildNodes(level2Node.id).map(
                                              (level3Node) => (
                                                <div
                                                  key={level3Node.id}
                                                  className="bg-gray-50 border border-gray-200 p-2 rounded"
                                                >
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                    <span className="text-gray-900 text-sm">
                                                      {level3Node.label}
                                                    </span>
                                                  </div>
                                                  {level3Node.description && (
                                                    <p className="text-gray-600 text-xs mt-1 ml-4">
                                                      {level3Node.description}
                                                    </p>
                                                  )}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
