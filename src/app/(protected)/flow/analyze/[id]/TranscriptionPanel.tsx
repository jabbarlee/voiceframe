"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUserToken } from "@/lib/auth";
import { Loader2, CheckCircle, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  audioId: string;
  setTranscriptionStatus: (
    s: "idle" | "loading" | "transcribing" | "completed" | "error"
  ) => void;
}

export default function TranscriptionPanel({
  audioId,
  setTranscriptionStatus,
}: Props) {
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState("");
  const [transcriptionData, setTranscriptionData] = useState<any>(null);

  // Download transcript as a text file
  const handleDownloadTranscript = () => {
    if (!currentTranscript) return;
    
    const blob = new Blob([currentTranscript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript-${audioId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Kick off the transcription flow when component mounts
    let mounted = true;

    const init = async () => {
      try {
        setTranscriptionError("");
        setTranscriptionProgress(0);
        setTranscriptionStatus("loading");

        const token = await getCurrentUserToken();
        if (!token) {
          setTranscriptionError("Authentication required");
          setTranscriptionStatus("error");
          return;
        }

        // Check for existing transcript first
        const transcriptResponse = await fetch(
          `/api/transcripts?audio_file_id=${audioId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (transcriptResponse.ok) {
          const transcriptJson = await transcriptResponse.json();
          if (transcriptJson.success && transcriptJson.data.length > 0) {
            const transcript = transcriptJson.data[0];
            if (!mounted) return;
            setCurrentTranscript(transcript.content);
            setTranscriptionData(transcript);
            setTranscriptionProgress(100);
            setIsTranscribing(false);
            setTranscriptionStatus("completed");
            return;
          }
        }

        // No existing transcript, start streaming transcription
        setIsTranscribing(true);
        setTranscriptionStatus("transcribing");

        const response = await fetch("/api/audio/transcribe/stream", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_file_id: audioId,
            options: { language: "en", high_quality: false },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader)
          throw new Error("No response body from streaming endpoint");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              switch (data.type) {
                case "progress":
                  if (mounted) setTranscriptionProgress(data.progress);
                  break;
                case "chunk":
                  if (mounted)
                    setCurrentTranscript((prev) => prev + data.chunk);
                  break;
                case "complete":
                  if (!mounted) return;
                  setTranscriptionData(data.transcript);
                  setCurrentTranscript(data.transcript.text);
                  setTranscriptionProgress(100);
                  setIsTranscribing(false);
                  setTranscriptionStatus("completed");
                  return;
                case "error":
                  throw new Error(data.error);
              }
            } catch (err: any) {
              // malformed line or parse error
              console.warn("Failed to parse SSE line", line, err);
            }
          }
        }
      } catch (err: any) {
        console.error("TranscriptionPanel error:", err);
        if (!mounted) return;
        setTranscriptionError(err.message || "Transcription failed");
        setIsTranscribing(false);
        setTranscriptionStatus("error");
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [audioId, setTranscriptionStatus]);

  return (
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
                  currentTranscript.split(" ").filter((w) => w.length > 0)
                    .length
                }
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                Characters: {currentTranscript.length}
              </span>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="p-4">
          {transcriptionError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-red-500 text-xl">❌</div>
                  <div>
                    <span className="text-red-800 font-medium block">
                      Transcription failed
                    </span>
                    <span className="text-red-600 text-sm">
                      {transcriptionError}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    // simple retry by re-mounting effect: update status to loading
                    setTranscriptionStatus("loading");
                    setCurrentTranscript("");
                    setTranscriptionError("");
                  }}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : isTranscribing ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="text-blue-800 font-medium">
                    Transcribing audio with OpenAI...
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
                  <div>
                    <span className="text-green-800 font-medium block">
                      Transcription completed successfully!
                    </span>
                    {transcriptionData && (
                      <span className="text-green-600 text-sm">
                        {transcriptionData.word_count} words •{" "}
                        {transcriptionData.model_used}
                        {transcriptionData.processing_time_ms &&
                          ` • ${(
                            transcriptionData.processing_time_ms / 1000
                          ).toFixed(1)}s`}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleDownloadTranscript}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          )}
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
  );
}
