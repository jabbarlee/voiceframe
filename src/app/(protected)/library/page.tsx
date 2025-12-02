"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileAudio,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  Brain,
  Target,
  Award,
  Upload,
  Plus,
  Music,
  SortAsc,
  SortDesc,
  Calendar,
  HardDrive,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserToken } from "@/lib/auth";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { FileActionsDropdown } from "@/components/ui/FileActionsDropdown";

interface AudioFile {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  public_url?: string;
  hasContent?: boolean;
}

interface UserUsage {
  id: string;
  uid: string;
  plan: string;
  allowed_minutes: number;
  used_minutes: number;
  cycle_start: string;
  remaining_minutes: number;
  is_over_limit: boolean;
}

export default function LibraryPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const router = useRouter();

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<AudioFile | null>(null);

  useEffect(() => {
    setTitle("Audio Library");
  }, [setTitle]);

  // Fetch audio files
  useEffect(() => {
    const fetchAudioFiles = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const idToken = await getCurrentUserToken();

        const response = await fetch("/api/audio", {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch audio files");
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to load audio files");
        }

        setAudioFiles(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load audio files"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudioFiles();
  }, [user]);

  // Fetch user usage data
  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;

      try {
        setIsLoadingUsage(true);
        const idToken = await getCurrentUserToken();

        const response = await fetch("/api/usage", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserUsage(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchUsage();
  }, [user]);

  // Filter, search, and sort logic
  const filteredAndSortedFiles = audioFiles
    .filter((file) => {
      const matchesSearch = file.original_filename
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || file.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.original_filename.localeCompare(b.original_filename);
          break;
        case "size":
          comparison = a.file_size_bytes - b.file_size_bytes;
          break;
        case "date":
        default:
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <Upload className="h-3 w-3 mr-1" />
            Uploaded
          </Badge>
        );
    }
  };

  // Handle view action
  const handleView = useCallback(
    (fileId: string) => {
      router.push(`/library/${fileId}`);
    },
    [router]
  );

  // Handle delete action - opens confirmation modal
  const handleDeleteClick = useCallback((file: AudioFile) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!fileToDelete) return;

    const idToken = await getCurrentUserToken();
    if (!idToken) {
      throw new Error("Authentication required. Please sign in again.");
    }

    let response: Response;
    try {
      response = await fetch(`/api/audio/${fileToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      // Handle network errors (no response received)
      console.error("Network error during delete:", fetchError);
      throw new Error(
        "Network error. Please check your internet connection and try again."
      );
    }

    let result;
    try {
      result = await response.json();
    } catch {
      // If we can't parse the response, provide a generic error
      throw new Error("Failed to process server response. Please try again.");
    }

    if (!response.ok || !result.success) {
      // Use the error message from the server if available
      throw new Error(result.error || "Failed to delete audio file");
    }

    // Remove the deleted file from the local state
    setAudioFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== fileToDelete.id)
    );

    // Close modal and reset state
    setDeleteModalOpen(false);
    setFileToDelete(null);
  }, [fileToDelete]);

  // Handle modal close
  const handleDeleteModalClose = useCallback(() => {
    setDeleteModalOpen(false);
    setFileToDelete(null);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">
                  Audio Library
                </div>
              </div>
              <div className="w-32"></div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your audio library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button */}
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>

            {/* Center - Library Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Music className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Audio Library
                  </div>
                  <div className="text-xs text-gray-500">
                    {audioFiles.length} files •{" "}
                    {audioFiles.filter((f) => f.status === "completed").length}{" "}
                    processed
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Upload button */}
            <Button
              onClick={() => router.push("/flow/upload")}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Audio</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Search and Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audio files..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Sort Options */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={sortBy === "date" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("date")}
                  className={`h-8 text-xs ${
                    sortBy === "date" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Date
                </Button>
                <Button
                  variant={sortBy === "name" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("name")}
                  className={`h-8 text-xs ${
                    sortBy === "name" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <FileAudio className="h-3 w-3 mr-1" />
                  Name
                </Button>
                <Button
                  variant={sortBy === "size" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("size")}
                  className={`h-8 text-xs ${
                    sortBy === "size" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <HardDrive className="h-3 w-3 mr-1" />
                  Size
                </Button>
              </div>

              {/* Sort Order */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="h-8"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFilterStatus(e.target.value)
                  }
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="failed">Failed</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-8 ${
                    viewMode === "grid" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-8 ${
                    viewMode === "list" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error: {error}</div>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : filteredAndSortedFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileAudio className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No files found" : "No audio files yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms or filters"
                    : "Upload your first audio file to get started with content generation"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => router.push("/flow/upload")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Audio File
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAndSortedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group ${
                      viewMode === "list"
                        ? "flex items-center p-4"
                        : "overflow-hidden"
                    }`}
                  >
                    {/* ...existing card content... */}
                    {viewMode === "grid" ? (
                      <>
                        {/* Card Content - Flex container */}
                        <div className="flex flex-col h-full">
                          {/* Card Header */}
                          <div className="p-4 pb-3 flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="p-2 bg-slate-100 rounded-lg">
                                <FileAudio className="h-6 w-6 text-slate-600" />
                              </div>
                              <FileActionsDropdown
                                onView={() => handleView(file.id)}
                                onDelete={() => handleDeleteClick(file)}
                              />
                            </div>

                            <h3
                              className="font-semibold text-gray-900 mb-2 truncate cursor-pointer hover:text-blue-600 transition-colors group-hover:text-blue-600"
                              onClick={() => handleView(file.id)}
                              title={file.original_filename}
                            >
                              {file.original_filename.replace(/\.[^/.]+$/, "")}
                            </h3>

                            <div className="space-y-2">
                              {getStatusBadge(file.status)}

                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{formatDate(file.created_at)}</span>
                              </div>

                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>
                                  {formatFileSize(file.file_size_bytes)}
                                </span>
                                {file.status === "completed" && (
                                  <div className="flex items-center text-blue-600">
                                    <Zap className="h-3 w-3 mr-1" />
                                    <span className="text-xs font-medium">
                                      Ready
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content indicators for completed files */}
                            {file.status === "completed" && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    <span>Summary</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Brain className="h-3 w-3 mr-1" />
                                    <span>Cards</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Target className="h-3 w-3 mr-1" />
                                    <span>Concepts</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Footer - Always at bottom */}
                          <div className="p-4 pt-0 mt-auto">
                            <Button
                              onClick={() => handleView(file.id)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                              size="sm"
                            >
                              {file.status === "completed"
                                ? "View Content"
                                : "View Details"}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // List View
                      <>
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileAudio className="h-5 w-5 text-blue-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => handleView(file.id)}
                            >
                              {file.original_filename.replace(/\.[^/.]+$/, "")}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>{formatDate(file.created_at)}</span>
                              <span>
                                {formatFileSize(file.file_size_bytes)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {getStatusBadge(file.status)}

                            {file.status === "completed" && (
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <BookOpen className="h-3 w-3" />
                                <Brain className="h-3 w-3" />
                                <Target className="h-3 w-3" />
                                <Award className="h-3 w-3" />
                              </div>
                            )}

                            <Button
                              onClick={() => handleView(file.id)}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              View
                            </Button>

                            <FileActionsDropdown
                              onView={() => handleView(file.id)}
                              onDelete={() => handleDeleteClick(file)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        {audioFiles.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Files */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-600">
                      Total Files
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {audioFiles.length}
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-slate-600" />
                </div>
              </div>

              {/* Completed Files */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-emerald-600">
                      Completed
                    </div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {
                        audioFiles.filter((f) => f.status === "completed")
                          .length
                      }
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-600">
                      {isLoadingUsage ? "Loading..." : "Used This Month"}
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {isLoadingUsage ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : userUsage ? (
                        `${userUsage.used_minutes}/${userUsage.allowed_minutes}`
                      ) : (
                        "0/30"
                      )}
                    </div>
                    {!isLoadingUsage && userUsage && (
                      <div className="text-xs text-blue-600 mt-1">
                        {userUsage.remaining_minutes} minutes left
                      </div>
                    )}
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Current Plan */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-purple-600">
                      Current Plan
                    </div>
                    <div className="text-2xl font-bold text-purple-900 capitalize">
                      {isLoadingUsage ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : userUsage ? (
                        userUsage.plan
                      ) : (
                        "Free"
                      )}
                    </div>
                    {!isLoadingUsage &&
                      userUsage &&
                      userUsage.is_over_limit && (
                        <div className="text-xs text-red-600 mt-1 font-medium">
                          Limit exceeded
                        </div>
                      )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Audio File"
        description="This action cannot be undone. This will permanently delete the audio file and all associated data including transcripts and generated learning content."
        itemName={fileToDelete?.original_filename}
        itemType="audio file"
      />
    </div>
  );
}
