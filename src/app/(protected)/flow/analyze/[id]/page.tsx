"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, Pause, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranscriptionPanel from "./TranscriptionPanel";
import AudioMetadataPanel from "./AudioMetadataPanel";

export default function AudioTranscriptionPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const audioId = params.id as string;

  // Track transcription status for header/spinner: loading -> transcribing -> completed/error
  const [transcriptionStatus, setTranscriptionStatus] = useState<
    "idle" | "loading" | "transcribing" | "completed" | "error"
  >("idle");
  // derived flags used by the header and metadata UI
  const isTranscribing =
    transcriptionStatus === "transcribing" || transcriptionStatus === "loading";
  const isSavingTranscript = false; // saving is handled inside TranscriptionPanel

  useEffect(() => {
    setTitle("Live Transcription");
  }, [setTitle]);

  // transcription logic now lives in TranscriptionPanel component

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

      {/* Transcription banner removed — handled inside TranscriptionPanel */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 min-h-0 overflow-hidden">
        {/* Left Side - Audio Metadata */}
        <AudioMetadataPanel
          audioId={audioId}
          transcriptionStatus={transcriptionStatus}
        />

        {/* Right Side - Live Transcript (handled by TranscriptionPanel) */}
        <TranscriptionPanel
          audioId={audioId}
          setTranscriptionStatus={setTranscriptionStatus}
        />
      </div>
    </div>
  );
}
