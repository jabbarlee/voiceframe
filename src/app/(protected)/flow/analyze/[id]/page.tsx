"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCurrentUserToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileAudio,
  Clock,
  Database,
  Loader2,
  CheckCircle,
  Pause,
  Play,
  Download,
  Calendar,
  HardDrive,
  Type,
  Sparkles,
  Upload,
  FileText,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioMetadata {
  id: string;
  uid: string;
  original_filename: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  public_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AudioTranscriptionPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const audioId = params.id as string;

  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);

  // Sample transcript segments that will appear progressively
  const sampleTranscript = `Welcome to today's product review meeting. I'm excited to discuss the progress we've made on our voice transcription platform.

First, let's talk about the user interface improvements. The team has done an excellent job creating a clean, intuitive design that makes it easy for users to upload and manage their audio files.

The drag-and-drop functionality is working seamlessly, and the progress indicators provide clear feedback during the upload process. Users can now see real-time progress as their files are being processed.

One of the key features we've implemented is the live transcription view. This allows users to see their audio being converted to text in real-time, which creates an engaging and transparent experience.

The metadata display shows all the important file information in a visually appealing format. Users can see file size, duration, format, and upload timestamp at a glance.

Moving forward, we'll be focusing on improving the accuracy of the transcription engine and adding support for multiple languages. The team is also working on speaker identification and timestamp markers.

The dashboard provides a comprehensive overview of all user activities, including upload statistics and recent transcriptions. This helps users keep track of their usage and manage their content effectively.

Thank you all for your hard work on this project. The results speak for themselves, and I'm confident that our users will love these new features.`;

  useEffect(() => {
    setTitle("Live Transcription");
  }, [setTitle]);

  // Fetch audio metadata - wait for user to be loaded
  useEffect(() => {
    const fetchAudioMetadata = async () => {
      try {
        const token = await getCurrentUserToken();
        if (!token) {
          setError("Authentication required");
          return;
        }

        const response = await fetch(`/api/audio/${audioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch audio metadata");
        }

        setAudioMetadata(data.data);
      } catch (error: any) {
        console.error("❌ Error fetching audio metadata:", error);
        setError(error.message || "Failed to load audio file");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch when we have a user and audioId
    if (user && audioId) {
      fetchAudioMetadata();
    } else if (user === null) {
      // User is explicitly null (not authenticated)
      setError("Please sign in to access this page");
      setIsLoading(false);
    }
    // If user is undefined, we're still loading auth state
  }, [user, audioId]);

  // Save transcript to database when transcription is completed
  const saveTranscript = async (transcript: string) => {
    if (!audioMetadata || !transcript.trim()) return;

    try {
      setIsSavingTranscript(true);
      console.log("💾 Saving transcript to database...");

      const token = await getCurrentUserToken();
      if (!token) {
        console.error("❌ No auth token available");
        return;
      }

      const response = await fetch("/api/transcripts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_file_id: audioMetadata.id,
          content: transcript,
          language: "en", // Default to English, could be detected or user-selected
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save transcript");
      }

      console.log("✅ Transcript saved successfully:", data.data.id);
    } catch (error: any) {
      console.error("❌ Error saving transcript:", error);
      // Don't show error to user as this is background operation
      // Could add a toast notification here if needed
    } finally {
      setIsSavingTranscript(false);
    }
  };

  // Simulate transcription progress
  useEffect(() => {
    if (!isTranscribing) return;

    const interval = setInterval(() => {
      setTranscriptionProgress((prev) => {
        const newProgress = prev + Math.random() * 3;
        if (newProgress >= 100) {
          setIsTranscribing(false);
          return 100;
        }
        return newProgress;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTranscribing]);

  // Simulate live transcript updates and save when completed
  useEffect(() => {
    if (!isTranscribing) {
      setCurrentTranscript(sampleTranscript);
      // Save transcript when transcription is completed
      if (audioMetadata && sampleTranscript.trim()) {
        saveTranscript(sampleTranscript);
      }
      return;
    }

    const targetLength = Math.floor(
      (transcriptionProgress / 100) * sampleTranscript.length
    );
    setCurrentTranscript(sampleTranscript.substring(0, targetLength));
  }, [transcriptionProgress, isTranscribing, sampleTranscript, audioMetadata]);

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "UNKNOWN";
  };

  const getMimeTypeDisplay = (mimeType: string) => {
    const typeMap: { [key: string]: string } = {
      "audio/mpeg": "MP3",
      "audio/wav": "WAV",
      "audio/mp4": "M4A",
      "audio/ogg": "OGG",
      "audio/webm": "WEBM",
    };
    return (
      typeMap[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "AUDIO"
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Loading audio file...</span>
        </div>
      </div>
    );
  }

  if (error || !audioMetadata) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">
            {error || "Audio file not found"}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
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

              {/* Step 2 - Current */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-full">
                  {isTranscribing ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-emerald-600">Transcribe</div>
                </div>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-3">
              {isTranscribing ? (
                <Button
                  variant="outline"
                  disabled
                  className="flex items-center space-x-2"
                >
                  <Pause className="h-4 w-4" />
                  <span className="hidden sm:inline">Processing...</span>
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  {isSavingTranscript && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mr-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </div>
                  )}
                  <Button
                    onClick={() => router.push(`/library/${audioId}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
                    disabled={isSavingTranscript}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Generate Content</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress/Completion Banner */}
      <div className="flex-shrink-0 px-6 pt-4">
        {isTranscribing ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-blue-800 font-medium">
                  Transcription in progress
                </span>
              </div>
              <span className="text-blue-600 font-semibold">
                {Math.round(transcriptionProgress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${transcriptionProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Transcription completed successfully!
                </span>
              </div>
              {isSavingTranscript && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Saving transcript...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 min-h-0 overflow-hidden">
        {/* Left Side - Audio Metadata */}
        <div className="w-full lg:w-80 lg:flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileAudio className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Audio File
                  </h3>
                  <p className="text-sm text-gray-500">
                    Metadata & Information
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* File Name */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Type className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Filename
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {audioMetadata.original_filename}
                  </p>
                </div>

                {/* File Size */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      File Size
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {formatFileSize(audioMetadata.file_size_bytes)}
                  </p>
                </div>

                {/* Format */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Format
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {getMimeTypeDisplay(audioMetadata.mime_type)}
                  </p>
                </div>

                {/* Upload Date */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Uploaded
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {formatDate(audioMetadata.created_at)}
                  </p>
                </div>

                {/* Processing Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center space-x-2">
                      {isTranscribing ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Status
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 capitalize">
                    {isTranscribing ? "Processing" : "Completed"}
                  </p>
                </div>

                {/* Download Transcript Button */}
                {!isTranscribing && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Transcript</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Live Transcript */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Live Transcript
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isTranscribing
                      ? "Transcription in progress..."
                      : "Transcription completed"}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>
                    Words:{" "}
                    {
                      currentTranscript
                        .split(" ")
                        .filter((word) => word.length > 0).length
                    }
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    Characters: {currentTranscript.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-800 leading-relaxed font-serif text-base whitespace-pre-wrap">
                  {currentTranscript}
                  {isTranscribing && (
                    <span className="inline-block w-2 h-5 bg-emerald-600 animate-pulse ml-1 align-text-bottom" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
