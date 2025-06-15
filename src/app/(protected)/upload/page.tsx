"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCurrentUserToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  Upload,
  FileAudio,
  X,
  CheckCircle,
  AlertCircle,
  Cloud,
  Mic,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  uploadedData?: {
    filename: string;
    path: string;
    size: number;
    url: string;
  };
}

export default function UploadPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle("Upload");
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

  const handleFiles = (files: File[]) => {
    const audioFiles = files.filter(
      (file) =>
        file.type.startsWith("audio/") ||
        file.name.toLowerCase().endsWith(".mp3") ||
        file.name.toLowerCase().endsWith(".wav") ||
        file.name.toLowerCase().endsWith(".m4a") ||
        file.name.toLowerCase().endsWith(".ogg")
    );

    const newFiles: UploadedFile[] = audioFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "pending",
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadFile = async (fileId: string) => {
    const fileToUpload = uploadedFiles.find((f) => f.id === fileId);
    if (!fileToUpload) return;

    try {
      // Update status to uploading
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? { ...file, status: "uploading", progress: 0 }
            : file
        )
      );

      // Get user token
      const idToken = await getCurrentUserToken();
      if (!idToken) {
        throw new Error("Authentication required");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", fileToUpload.file);
      formData.append("idToken", idToken);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadedFiles((prev) =>
              prev.map((file) =>
                file.id === fileId ? { ...file, progress } : file
              )
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                setUploadedFiles((prev) =>
                  prev.map((file) =>
                    file.id === fileId
                      ? {
                          ...file,
                          status: "completed",
                          progress: 100,
                          uploadedData: response.data,
                        }
                      : file
                  )
                );
                resolve();
              } else {
                throw new Error(response.error || "Upload failed");
              }
            } catch (error) {
              reject(new Error("Invalid response from server"));
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                status: "error",
                error: error.message || "Upload failed",
              }
            : file
        )
      );
    }
  };

  const startUploads = async () => {
    if (!user) {
      setError("Please sign in to upload files");
      return;
    }

    setIsUploading(true);
    const pendingFiles = uploadedFiles.filter(
      (file) => file.status === "pending"
    );

    // Upload files sequentially
    for (const file of pendingFiles) {
      try {
        await uploadFile(file.id);
      } catch (error) {
        console.error("Upload failed for file:", file.file.name, error);
        // Continue with next file even if one fails
      }
    }

    setIsUploading(false);
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "uploading":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
      )}

      {/* Header Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Upload Audio Files
            </h1>
            <p className="text-gray-600 mt-1">
              Upload your audio files to start transcription
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Cloud className="h-4 w-4" />
              <span>Cloud Storage</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileAudio className="h-4 w-4" />
              <span>Audio Files Only</span>
            </div>
          </div>
        </div>

        {/* Upload Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-xl font-bold text-gray-900">
                  {uploadedFiles.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">
                  {uploadedFiles.filter((f) => f.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-xl font-bold text-gray-900">
                  {uploadedFiles.filter((f) => f.status === "uploading").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Flexible */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Upload Area - Left Side */}
        <div className="flex-1">
          <div
            className={`h-full border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 flex items-center justify-center ${
              isDragOver
                ? "border-emerald-400 bg-emerald-50"
                : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Upload className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop audio files here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse your computer
                </p>
              </div>

              <input
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <FileAudio className="h-5 w-5" />
                <span>Select Audio Files</span>
              </label>

              <div className="mt-6 text-sm text-gray-500">
                <p>Supported formats: MP3, WAV, M4A, OGG</p>
                <p>Maximum file size: 100MB per file</p>
              </div>
            </div>
          </div>
        </div>

        {/* File List - Right Side */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Uploaded Files
                </h3>
                {uploadedFiles.length > 0 && (
                  <Button
                    onClick={startUploads}
                    disabled={
                      isUploading ||
                      !user ||
                      uploadedFiles.every((f) => f.status !== "pending")
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Cloud className="h-4 w-4 mr-2" />
                        Upload to Cloud
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {uploadedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Mic className="h-12 w-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No files uploaded yet</p>
                  <p className="text-sm">Upload audio files to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getStatusIcon(uploadedFile.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(uploadedFile.file.size)}
                              {uploadedFile.status === "completed" &&
                                " • Uploaded to cloud"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(uploadedFile.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                          disabled={uploadedFile.status === "uploading"}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {uploadedFile.status === "uploading" && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Uploading to cloud...</span>
                            <span>{uploadedFile.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadedFile.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {uploadedFile.status === "error" &&
                        uploadedFile.error && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
                            Error: {uploadedFile.error}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
