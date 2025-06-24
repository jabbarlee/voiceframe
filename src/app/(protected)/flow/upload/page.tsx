"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCurrentUserToken } from "@/lib/auth";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileAudio,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export default function FlowUploadPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setTitle("Upload Audio");
  }, [setTitle]);

  // Accepted audio file types
  const acceptedTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/mp4",
    "audio/m4a",
    "audio/ogg",
    "audio/webm",
    "audio/aac",
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return "Please select a valid audio file (MP3, WAV, M4A, OGG, etc.)";
    }
    if (file.size > maxFileSize) {
      return "File size must be less than 100MB";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setError("");
    setUploadProgress({ loaded: 0, total: selectedFile.size, percentage: 0 });

    try {
      // Get the user's ID token for authentication
      const idToken = await getCurrentUserToken();
      if (!idToken) {
        throw new Error("Authentication required. Please sign in again.");
      }

      console.log("🔑 Got user token, creating form data", idToken);

      // Create form data - only include the file, token goes in header
      const formData = new FormData();
      formData.append("audio", selectedFile);

      console.log("📤 Sending upload request to /api/audio/upload");
      console.log("File details:", {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      });

      // Upload with progress tracking using XMLHttpRequest
      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            console.log(`📊 Upload progress: ${percentage}%`);
            setUploadProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
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
                // Upload successful - redirect to analyze page
                router.push(`/flow/analyze/${response.data.id}`);
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
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(
                new Error(
                  errorResponse.error ||
                    `Upload failed with status: ${xhr.status}`
                )
              );
            } catch {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
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

        xhr.open("POST", "/api/audio/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);
        xhr.timeout = 5 * 60 * 1000; // 5 minutes timeout
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileTypeDisplay = (file: File) => {
    return file.type.split("/")[1]?.toUpperCase() || "AUDIO";
  };

  // Show loading while waiting for auth state
  if (user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Loading...</span>
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
            Please sign in to upload audio files
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Match sidebar header height */}
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

            {/* Center - Progress Steps */}
            <div className="flex items-center space-x-8">
              {/* Step 1 - Current */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-full">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-600">Upload</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex-1 h-px bg-gray-200 min-w-[2.5rem]"></div>

              {/* Step 2 - Pending */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-full">
                  <Mic className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-400">Analyze</div>
                </div>
              </div>
            </div>

            {/* Right side - Upload button */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    <span>Upload & Continue</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 min-h-0">
        {/* Left Side - Upload Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Upload Card */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
            {!selectedFile ? (
              <div className="flex-1 flex flex-col">
                <div className="text-center p-6 pb-3">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-emerald-100 rounded-full">
                      <Sparkles className="h-12 w-12 text-emerald-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Upload Your Audio File
                  </h2>
                  <p className="text-lg text-gray-600">
                    Transform your audio into AI-generated content
                  </p>
                </div>

                <div
                  className={`relative flex-1 m-6 mt-3 flex flex-col justify-center items-center text-center border-2 border-dashed rounded-xl transition-all duration-200 ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-50 scale-[1.02]"
                      : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50"
                  }`}
                  onDragEnter={handleDragIn}
                  onDragLeave={handleDragOut}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="mb-8">
                    <Upload className="h-20 w-20 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Drop your audio file here
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    or click anywhere to browse from your computer
                  </p>

                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />

                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 pointer-events-none text-lg px-8 py-3"
                    disabled={isUploading}
                  >
                    <Upload className="h-6 w-6 mr-3" />
                    Choose Audio File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-emerald-100 rounded-full">
                      <FileAudio className="h-12 w-12 text-emerald-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Ready to Upload
                  </h2>
                  <p className="text-lg text-gray-600">
                    Your audio file is selected and ready for processing
                  </p>
                </div>

                {/* Selected File Display */}
                <div className="p-8 bg-gray-50 rounded-xl mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="p-4 bg-emerald-100 rounded-xl">
                        <FileAudio className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xl">
                          {selectedFile.name}
                        </p>
                        <p className="text-gray-600 text-lg">
                          {formatFileSize(selectedFile.size)} •{" "}
                          {getFileTypeDisplay(selectedFile)}
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedFile(null);
                          setError("");
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && uploadProgress && (
                  <div className="mb-8 p-8 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        <span className="font-medium text-blue-800 text-lg">
                          Uploading your file...
                        </span>
                      </div>
                      <span className="font-semibold text-blue-600 text-lg">
                        {uploadProgress.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-4 mb-3">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>
                        {formatFileSize(uploadProgress.loaded)} uploaded
                      </span>
                      <span>{formatFileSize(uploadProgress.total)} total</span>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mb-8 p-8 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-800 text-lg">
                          Upload Failed
                        </p>
                        <p className="text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center items-center">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => {
                      setSelectedFile(null);
                      setError("");
                    }}
                    disabled={isUploading}
                    className="px-4 py-2"
                  >
                    Choose Different File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Info Section */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-6 min-h-0">
          {/* What happens after upload - 50% */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-start space-x-4 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                What happens next?
              </h3>
            </div>
            <div className="flex-1 space-y-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Your audio is securely processed using advanced AI
                  transcription
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Review and edit the generated transcript before proceeding
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Choose from multiple content formats: notes, posts, articles
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Download or share your AI-generated content instantly
                </span>
              </div>
            </div>
          </div>

          {/* File Requirements & Security - 50% */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-start space-x-4 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <FileAudio className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                Requirements & Security
              </h3>
            </div>
            <div className="flex-1 space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-700 mb-1">
                  Supported Formats
                </p>
                <p>MP3, WAV, M4A, OGG, AAC, WEBM</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">
                  File Size Limit
                </p>
                <p>Maximum 100MB per file</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">
                  Privacy & Security
                </p>
                <p>
                  Files are encrypted, processed securely, and automatically
                  deleted after use
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Best Results</p>
                <p>
                  Clear speech in quiet environments work best for transcription
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
