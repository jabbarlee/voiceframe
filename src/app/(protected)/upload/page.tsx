"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCurrentUserToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileAudio,
  X,
  CheckCircle,
  AlertCircle,
  Mic,
  Loader2,
  ArrowRight,
  File,
  Cloud,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  uploadedData?: {
    id: string;
    filename: string;
    path: string;
    size: number;
    url: string;
  };
}

export default function UploadPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle("Upload Audio");
  }, [setTitle]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Take only the first file
    const file = files[0];

    const isAudioFile =
      file.type.startsWith("audio/") ||
      file.name.toLowerCase().endsWith(".mp3") ||
      file.name.toLowerCase().endsWith(".wav") ||
      file.name.toLowerCase().endsWith(".m4a") ||
      file.name.toLowerCase().endsWith(".ogg");

    if (!isAudioFile) {
      setError("Please select a valid audio file (MP3, WAV, M4A, OGG)");
      return;
    }

    // Clear any previous uploads
    setUploadedFile(null);
    setError("");

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "pending",
      progress: 0,
    };

    setUploadedFile(newFile);

    // Automatically start uploading the file
    await uploadFile(newFile.id);
  };

  const uploadFile = async (fileId: string) => {
    if (!user) {
      setError("Please sign in to upload files");
      return;
    }

    // Find the file to upload in the current state
    setUploadedFile((prev) => {
      if (!prev || prev.id !== fileId) {
        console.error("File not found for upload");
        return prev;
      }

      const fileToUpload = prev;
      console.log("🚀 Starting upload for file:", fileToUpload.file.name);

      // Start the upload process
      performUpload(fileToUpload);

      // Update status to uploading
      return { ...prev, status: "uploading", progress: 0 };
    });
  };

  const performUpload = async (fileToUpload: UploadedFile) => {
    try {
      // Get user token
      const idToken = await getCurrentUserToken();
      if (!idToken) {
        throw new Error("Authentication required");
      }

      console.log("🔑 Got user token, creating form data");

      // Create form data
      const formData = new FormData();
      formData.append("file", fileToUpload.file);
      formData.append("idToken", idToken);

      console.log("📤 Sending upload request to /api/upload");

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            console.log(`📊 Upload progress: ${progress}%`);
            setUploadedFile((prev) => (prev ? { ...prev, progress } : null));
          }
        });

        xhr.addEventListener("load", () => {
          console.log(`📥 Upload response received. Status: ${xhr.status}`);

          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("📋 Upload response:", response);

              if (response.success && response.data) {
                console.log("✅ Upload successful. File ID:", response.data.id);
                setUploadedFile((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: "completed",
                        progress: 100,
                        uploadedData: response.data,
                      }
                    : null
                );
                resolve();
              } else {
                console.error("❌ Upload failed:", response.error);
                throw new Error(response.error || "Upload failed");
              }
            } catch (parseError) {
              console.error("❌ Failed to parse response:", parseError);
              reject(new Error("Invalid response from server"));
            }
          } else {
            console.error(`❌ Upload failed with status: ${xhr.status}`);
            console.error("Response text:", xhr.responseText);
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          console.error("❌ Network error during upload");
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("timeout", () => {
          console.error("❌ Upload timeout");
          reject(new Error("Upload timeout"));
        });

        xhr.open("POST", "/api/upload");
        xhr.timeout = 5 * 60 * 1000; // 5 minutes timeout
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      setUploadedFile((prev) =>
        prev
          ? {
              ...prev,
              status: "error",
              error: error.message || "Upload failed",
            }
          : null
      );
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleNextStep = (audioFileId: string) => {
    console.log("🎯 Navigating to transcript page for file:", audioFileId);
    router.push(`/dashboard/audio/${audioFileId}`);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Upload Audio
                </h1>
                <p className="mt-1 text-gray-600">
                  Upload your audio files to start creating AI-powered content
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Cloud className="h-4 w-4" />
                  <span>Secure Storage</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Zap className="h-4 w-4" />
                  <span>AI Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex-shrink-0">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Upload Area - Left Side */}
            <div className="lg:col-span-2">
              {!uploadedFile ? (
                <div
                  className={`h-full min-h-[500px] border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 flex items-center justify-center ${
                    isDragOver
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/50 bg-white"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <Upload className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Drop your audio file here
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      Upload your audio file and let our AI transform it into
                      professional content
                    </p>

                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors inline-flex items-center space-x-3 text-lg"
                    >
                      <FileAudio className="h-6 w-6" />
                      <span>Choose Audio File</span>
                    </label>

                    <div className="mt-8 text-gray-500">
                      <div className="flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <FileAudio className="h-4 w-4" />
                          <span>MP3, WAV, M4A, OGG</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Cloud className="h-4 w-4" />
                          <span>Max 100MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex items-center justify-center">
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-2xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                      {uploadedFile.status === "completed"
                        ? "Upload Complete!"
                        : "Processing Your File"}
                    </h2>
                    <div
                      className={`flex items-center space-x-6 px-6 py-5 rounded-xl border transition-all duration-200 ${
                        uploadedFile.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : uploadedFile.status === "uploading"
                          ? "bg-blue-50 border-blue-200"
                          : uploadedFile.status === "error"
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        {getStatusIcon(uploadedFile.status)}
                        <div className="flex flex-col flex-1">
                          <span className="text-base font-semibold text-gray-900">
                            {uploadedFile.file.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatFileSize(uploadedFile.file.size)}
                            {uploadedFile.status === "completed" &&
                              " • Uploaded successfully"}
                          </span>
                        </div>
                      </div>

                      {uploadedFile.status === "uploading" && (
                        <div className="flex items-center space-x-4">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadedFile.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-blue-600 font-semibold text-sm">
                            {uploadedFile.progress}%
                          </span>
                        </div>
                      )}

                      {uploadedFile.status === "completed" &&
                        uploadedFile.uploadedData && (
                          <Button
                            onClick={() =>
                              handleNextStep(uploadedFile.uploadedData!.id)
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <span className="mr-2">Get Transcript</span>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}

                      {uploadedFile.status === "error" && (
                        <span className="text-red-600 font-semibold text-sm">
                          Upload Failed
                        </span>
                      )}

                      <button
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={uploadedFile.status === "uploading"}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {uploadedFile.status === "completed" && (
                      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <p className="text-sm text-green-700 font-medium">
                            Your file has been uploaded successfully! Click "Get
                            Transcript" to start processing.
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadedFile.error && uploadedFile.status === "error" && (
                      <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-sm text-red-600">
                          <strong>Error:</strong> {uploadedFile.error}
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          Please try uploading again or contact support if the
                          problem persists.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features Section - Right Side Cards */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  What happens next?
                </h3>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileAudio className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Audio Analysis
                      </h4>
                      <p className="text-sm text-gray-600">
                        We analyze your audio file and extract key insights,
                        themes, and important content automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        AI Processing
                      </h4>
                      <p className="text-sm text-gray-600">
                        Our AI transforms your content into multiple
                        professional formats including social posts, blogs, and
                        more.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Ready to Use
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get polished, professional content ready for social
                        media, blogs, newsletters, and more platforms.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supported Formats Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6">
                  <h4 className="font-semibold text-emerald-900 mb-3">
                    Supported Formats
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span>MP3</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span>WAV</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span>M4A</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span>OGG</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-emerald-600">
                    Maximum file size: 100MB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
