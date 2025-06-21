"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

// Add type definitions
type SummaryTone = "professional" | "friendly" | "eli5";
type StudyPackTemplate = "academic" | "modern" | "minimal" | "creative";

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

  studyPacks: {
    metadata: {
      title: "Machine Learning Fundamentals",
      subtitle: "Complete Study Guide",
      author: "AI-Generated Content",
      tags: ["Machine Learning", "AI", "Data Science", "Algorithms"],
      duration: "45 minutes",
      level: "Intermediate",
      generatedAt: "2024-01-15T10:30:00Z",
    },
    templates: [
      {
        id: "academic",
        name: "Academic Paper",
        description: "Clean, scholarly design with proper citations",
        preview: "/api/placeholder/300/400",
        color: "blue",
        features: ["Table of Contents", "References", "Clean Typography"],
      },
      {
        id: "modern",
        name: "Modern Magazine",
        description: "Sleek, contemporary layout with visual elements",
        preview: "/api/placeholder/300/400",
        color: "purple",
        features: ["Visual Elements", "Modern Layout", "Color Accents"],
      },
      {
        id: "minimal",
        name: "Minimal Clean",
        description: "Simple, distraction-free design for focus",
        preview: "/api/placeholder/300/400",
        color: "gray",
        features: ["Minimal Design", "High Readability", "Clean Spacing"],
      },
      {
        id: "creative",
        name: "Creative Studio",
        description: "Vibrant, engaging design with illustrations",
        preview: "/api/placeholder/300/400",
        color: "emerald",
        features: ["Illustrations", "Vibrant Colors", "Engaging Layout"],
      },
    ],
    stats: {
      totalPages: 12,
      wordCount: 2847,
      readingTime: "11 min",
      concepts: 6,
      flashcards: 5,
    },
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
  const [selectedTemplate, setSelectedTemplate] =
    useState<StudyPackTemplate>("academic");

  // Mind Map specific state and logic
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];

    // Root node
    nodes.push({
      id: "root",
      type: "default",
      position: { x: 400, y: 50 },
      data: {
        label: "Machine Learning",
        category: "root",
      },
      style: {
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        color: "white",
        border: "none",
        width: 200,
        height: 80,
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });

    // Level 1 nodes
    const level1Positions = [
      { x: 100, y: 200 },
      { x: 400, y: 200 },
      { x: 700, y: 200 },
    ];

    const level1Nodes = sampleData.mindMap.nodes.filter((n) => n.level === 1);
    level1Nodes.forEach((node, index) => {
      nodes.push({
        id: node.id,
        type: "default",
        position: level1Positions[index],
        data: {
          label: node.label,
          category: "level1",
        },
        style: {
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
          border: "none",
          width: 160,
          height: 60,
          fontSize: "14px",
          fontWeight: "600",
          borderRadius: "10px",
          boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)",
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });

    // Level 2 nodes
    let level2X = 50;
    const level2Y = 350;
    const level2Nodes = sampleData.mindMap.nodes.filter((n) => n.level === 2);
    level2Nodes.forEach((node) => {
      nodes.push({
        id: node.id,
        type: "default",
        position: { x: level2X, y: level2Y },
        data: {
          label: node.label,
          description: node.description,
          category: "level2",
        },
        style: {
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          color: "white",
          border: "none",
          width: 140,
          height: 50,
          fontSize: "12px",
          fontWeight: "500",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      level2X += 180;
    });

    // Level 3 nodes
    let level3X = 50;
    const level3Y = 470;
    const level3Nodes = sampleData.mindMap.nodes.filter((n) => n.level === 3);
    level3Nodes.forEach((node) => {
      nodes.push({
        id: node.id,
        type: "default",
        position: { x: level3X, y: level3Y },
        data: {
          label: node.label,
          description: node.description,
          category: "level3",
        },
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          border: "none",
          width: 120,
          height: 40,
          fontSize: "11px",
          fontWeight: "500",
          borderRadius: "6px",
          boxShadow: "0 3px 10px rgba(16, 185, 129, 0.3)",
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      level3X += 140;
    });

    return nodes;
  }, []);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    sampleData.mindMap.nodes.forEach((node) => {
      if (node.parent) {
        edges.push({
          id: `${node.parent}-${node.id}`,
          source: node.parent,
          target: node.id,
          type: "smoothstep",
          animated: false,
          style: {
            stroke: "#94a3b8",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#94a3b8",
          },
        });
      }
    });

    return edges;
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
    {
      id: "studypack",
      icon: Award,
      label: "Study Pack",
      description: "Complete shareable study package",
      color: "indigo",
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Audio Info Header - Smaller height */}
          <div className="px-6 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3 h-16">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileAudio className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-gray-900 truncate"
                  title={sampleData.audioTitle}
                >
                  {sampleData.audioTitle}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 flex-shrink-0" />
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
                        ? type.color === "emerald"
                          ? "bg-emerald-50 border-emerald-200 shadow-sm"
                          : type.color === "blue"
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : type.color === "purple"
                          ? "bg-purple-50 border-purple-200 shadow-sm"
                          : type.color === "orange"
                          ? "bg-orange-50 border-orange-200 shadow-sm"
                          : "bg-indigo-50 border-indigo-200 shadow-sm"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? type.color === "emerald"
                              ? "bg-emerald-100"
                              : type.color === "blue"
                              ? "bg-blue-100"
                              : type.color === "purple"
                              ? "bg-purple-100"
                              : type.color === "orange"
                              ? "bg-orange-100"
                              : "bg-indigo-100"
                            : "bg-gray-200"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive
                              ? type.color === "emerald"
                                ? "text-emerald-600"
                                : type.color === "blue"
                                ? "text-blue-600"
                                : type.color === "purple"
                                ? "text-purple-600"
                                : type.color === "orange"
                                ? "text-orange-600"
                                : "text-indigo-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            isActive
                              ? type.color === "emerald"
                                ? "text-emerald-900"
                                : type.color === "blue"
                                ? "text-blue-900"
                                : type.color === "purple"
                                ? "text-purple-900"
                                : type.color === "orange"
                                ? "text-orange-900"
                                : "text-indigo-900"
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
              {/* Summary Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
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
              {/* Flashcards Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
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
              {/* Concepts Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
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

          {/* Study Pack Tab */}
          {activeTab === "studypack" && (
            <div className="flex-1 flex flex-col h-full">
              {/* Study Pack Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Study Pack Generator
                      </h2>
                      <p className="text-sm text-gray-500">
                        Create beautiful, shareable study packages
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
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Generate Pack</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Study Pack Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                  {/* Pack Overview */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {sampleData.studyPacks.metadata.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {sampleData.studyPacks.metadata.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sampleData.studyPacks.metadata.tags.map(
                            (tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="mt-4 lg:mt-0 lg:text-right">
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>
                            Level: {sampleData.studyPacks.metadata.level}
                          </div>
                          <div>
                            Duration: {sampleData.studyPacks.metadata.duration}
                          </div>
                          <div>
                            Reading: {sampleData.studyPacks.stats.readingTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pack Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {sampleData.studyPacks.stats.totalPages}
                        </div>
                        <div className="text-sm text-gray-600">Pages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {sampleData.studyPacks.stats.wordCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Words</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {sampleData.studyPacks.stats.concepts}
                        </div>
                        <div className="text-sm text-gray-600">Concepts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {sampleData.studyPacks.stats.flashcards}
                        </div>
                        <div className="text-sm text-gray-600">Flashcards</div>
                      </div>
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Choose Your Template
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {sampleData.studyPacks.templates.map((template) => (
                        <div
                          key={template.id}
                          className={`group relative bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                            selectedTemplate === template.id
                              ? template.color === "blue"
                                ? "border-blue-300 ring-2 ring-blue-100 shadow-lg"
                                : template.color === "purple"
                                ? "border-purple-300 ring-2 ring-purple-100 shadow-lg"
                                : template.color === "gray"
                                ? "border-gray-300 ring-2 ring-gray-100 shadow-lg"
                                : "border-emerald-300 ring-2 ring-emerald-100 shadow-lg"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                          }`}
                          onClick={() =>
                            setSelectedTemplate(
                              template.id as StudyPackTemplate
                            )
                          }
                        >
                          {/* Template Preview */}
                          <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative">
                            <div className="absolute inset-4 bg-white rounded shadow-sm">
                              <div className="p-3 space-y-2">
                                <div
                                  className={`h-2 rounded w-3/4 ${
                                    template.color === "blue"
                                      ? "bg-blue-200"
                                      : template.color === "purple"
                                      ? "bg-purple-200"
                                      : template.color === "gray"
                                      ? "bg-gray-200"
                                      : "bg-emerald-200"
                                  }`}
                                ></div>
                                <div className="h-1 bg-gray-200 rounded w-full"></div>
                                <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-1 bg-gray-200 rounded w-4/6"></div>
                                <div className="space-y-1 pt-2">
                                  <div className="h-1 bg-gray-100 rounded w-full"></div>
                                  <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                                  <div className="h-1 bg-gray-100 rounded w-3/4"></div>
                                </div>
                              </div>
                            </div>
                            {selectedTemplate === template.id && (
                              <div className="absolute top-2 right-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    template.color === "blue"
                                      ? "bg-blue-600"
                                      : template.color === "purple"
                                      ? "bg-purple-600"
                                      : template.color === "gray"
                                      ? "bg-gray-600"
                                      : "bg-emerald-600"
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Template Info */}
                          <div className="p-4">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {template.name}
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">
                              {template.description}
                            </p>
                            <div className="space-y-1">
                              {template.features.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center text-xs text-gray-500"
                                >
                                  <div
                                    className={`w-1 h-1 rounded-full mr-2 ${
                                      template.color === "blue"
                                        ? "bg-blue-400"
                                        : template.color === "purple"
                                        ? "bg-purple-400"
                                        : template.color === "gray"
                                        ? "bg-gray-400"
                                        : "bg-emerald-400"
                                    }`}
                                  ></div>
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Template Preview
                          </h4>
                          <p className="text-sm text-gray-500">
                            {
                              sampleData.studyPacks.templates.find(
                                (t) => t.id === selectedTemplate
                              )?.name
                            }{" "}
                            Style
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Full Preview
                          </Button>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Mock Preview */}
                    <div className="p-6">
                      <div className="max-w-2xl mx-auto">
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center ${
                            selectedTemplate === "academic"
                              ? "border-blue-300 bg-blue-50"
                              : selectedTemplate === "modern"
                              ? "border-purple-300 bg-purple-50"
                              : selectedTemplate === "minimal"
                              ? "border-gray-300 bg-gray-50"
                              : "border-emerald-300 bg-emerald-50"
                          }`}
                        >
                          <div
                            className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                              selectedTemplate === "academic"
                                ? "bg-blue-100"
                                : selectedTemplate === "modern"
                                ? "bg-purple-100"
                                : selectedTemplate === "minimal"
                                ? "bg-gray-100"
                                : "bg-emerald-100"
                            }`}
                          >
                            <FileText
                              className={`h-8 w-8 ${
                                selectedTemplate === "academic"
                                  ? "text-blue-600"
                                  : selectedTemplate === "modern"
                                  ? "text-purple-600"
                                  : selectedTemplate === "minimal"
                                  ? "text-gray-600"
                                  : "text-emerald-600"
                              }`}
                            />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Study Pack Preview
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Your complete{" "}
                            {sampleData.studyPacks.templates
                              .find((t) => t.id === selectedTemplate)
                              ?.name.toLowerCase()}{" "}
                            study package will include:
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-left space-y-2">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                                Summary Notes
                              </div>
                              <div className="flex items-center">
                                <Brain className="h-4 w-4 mr-2 text-gray-400" />
                                Flashcards
                              </div>
                            </div>
                            <div className="text-left space-y-2">
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-2 text-gray-400" />
                                Key Concepts
                              </div>
                              <div className="flex items-center">
                                <GitBranch className="h-4 w-4 mr-2 text-gray-400" />
                                Mind Map
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sharing Options */}
                  <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Sharing & Export Options
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center space-x-2 h-12"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download PDF</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center space-x-2 h-12"
                      >
                        <Copy className="h-5 w-5" />
                        <span>Copy Link</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center space-x-2 h-12"
                      >
                        <Sparkles className="h-5 w-5" />
                        <span>Share Pack</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mind Map Tab */}
          {activeTab === "mindmap" && (
            <div className="flex-1 flex flex-col h-full">
              {/* Mind Map Header - Smaller consistent height */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <GitBranch className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Interactive Mind Map
                      </h2>
                      <p className="text-sm text-gray-500">
                        Visual knowledge structure with{" "}
                        {sampleData.mindMap.nodes.length} connected concepts
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

              {/* Mind Map Content */}
              <div className="flex-1 min-h-0 bg-gradient-to-br from-slate-50 to-gray-100">
                <div className="h-full w-full">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    attributionPosition="top-right"
                    className="bg-gradient-to-br from-slate-50 to-gray-100"
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    minZoom={0.2}
                    maxZoom={2}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                  >
                    <Background color="#e2e8f0" gap={20} size={1} />
                    <Controls
                      className="bg-white border border-gray-200 rounded-lg shadow-lg"
                      showInteractive={false}
                    />
                    <MiniMap
                      className="bg-white border border-gray-200 rounded-lg shadow-lg"
                      nodeColor={(node) => {
                        switch (node.data.category) {
                          case "root":
                            return "#f97316";
                          case "level1":
                            return "#3b82f6";
                          case "level2":
                            return "#8b5cf6";
                          case "level3":
                            return "#10b981";
                          default:
                            return "#6b7280";
                        }
                      }}
                      nodeStrokeWidth={3}
                      zoomable
                      pannable
                    />
                  </ReactFlow>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
