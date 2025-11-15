"use client";

import React, { useEffect, useState } from "react";
import {
  FileAudio,
  Database,
  Loader2,
  CheckCircle,
  Download,
  Calendar,
  HardDrive,
  Type,
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

interface Props {
  audioId: string;
  transcriptionStatus:
    | "idle"
    | "loading"
    | "transcribing"
    | "completed"
    | "error";
}

export default function AudioMetadataPanel({
  audioId,
  transcriptionStatus,
}: Props) {
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAudioMetadata = async () => {
      try {
        setError("");
        setIsLoading(true);
        const response = await fetch(`/api/audio/${audioId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch audio metadata");
        }

        setAudioMetadata(data.data);
      } catch (err: any) {
        console.error("❌ Error fetching audio metadata:", err);
        setError(err.message || "Failed to load audio file");
      } finally {
        setIsLoading(false);
      }
    };

    if (audioId) {
      fetchAudioMetadata();
    }
  }, [audioId]);

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

  if (error) {
    return (
      <div className="w-full lg:w-80 lg:flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileAudio className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Audio File
                </h3>
                <p className="text-sm text-red-500">Error loading metadata</p>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              <p className="text-sm text-gray-500">Metadata & Information</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Loading metadata...</span>
            </div>
          ) : audioMetadata ? (
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
                    {transcriptionStatus === "transcribing" ||
                    transcriptionStatus === "loading" ? (
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
                  {transcriptionStatus === "transcribing" ||
                  transcriptionStatus === "loading"
                    ? "Processing"
                    : "Completed"}
                </p>
              </div>

              {/* Download Transcript Button */}
              {transcriptionStatus === "completed" && (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
