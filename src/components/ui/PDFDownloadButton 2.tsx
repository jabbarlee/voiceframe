"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { getCurrentUserToken } from "@/lib/auth";

interface PDFDownloadButtonProps {
  audioId: string;
  audioTitle: string;
  template: "academic" | "modern" | "minimal" | "creative";
  options?: {
    includeSummary?: boolean;
    summaryTone?: "professional" | "friendly" | "eli5";
    includeFlashcards?: boolean;
    includeConcepts?: boolean;
    includeMetadata?: boolean;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "secondary";
}

export function PDFDownloadButton({
  audioId,
  audioTitle,
  template,
  options = {
    includeSummary: true,
    summaryTone: "professional",
    includeFlashcards: true,
    includeConcepts: true,
    includeMetadata: true,
  },
  className = "",
  size = "md",
  variant = "default",
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      setLastError(null);
      setLastSuccess(false);

      // Get auth token
      const idToken = await getCurrentUserToken();
      if (!idToken) {
        throw new Error("Authentication required");
      }

      // Generate PDF
      const response = await fetch(`/api/content/${audioId}/pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${audioTitle
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")}_study_pack.pdf`;

      if (contentDisposition && contentDisposition.includes("filename=")) {
        const matches = contentDisposition.match(/filename="([^"]+)"/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastSuccess(true);
      console.log(`✅ PDF downloaded successfully: ${filename}`);

      // Reset success indicator after 3 seconds
      setTimeout(() => setLastSuccess(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate PDF";
      setLastError(errorMessage);
      console.error("❌ PDF download failed:", error);

      // Reset error after 5 seconds
      setTimeout(() => setLastError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-8 px-3 text-sm";
      case "lg":
        return "h-12 px-6 text-base";
      default:
        return "h-10 px-4 text-sm";
    }
  };

  const getButtonIcon = () => {
    if (isGenerating) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (lastSuccess) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (lastError) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Download className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isGenerating) return "Generating...";
    if (lastSuccess) return "Downloaded!";
    if (lastError) return "Try Again";
    return "Download PDF";
  };

  const getButtonVariant = () => {
    if (lastSuccess) return "outline";
    if (lastError) return "outline";
    return variant;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        variant={getButtonVariant()}
        className={`${getButtonSize()} ${className} flex items-center space-x-2 transition-all duration-300 ${
          lastSuccess
            ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
            : lastError
            ? "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
            : ""
        }`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </Button>

      {/* Error message */}
      {lastError && (
        <div className="text-xs text-red-600 text-center max-w-xs">
          {lastError}
        </div>
      )}

      {/* Success message */}
      {lastSuccess && (
        <div className="text-xs text-green-600 text-center max-w-xs">
          Study pack PDF downloaded successfully!
        </div>
      )}

      {/* Loading message */}
      {isGenerating && (
        <div className="text-xs text-blue-600 text-center max-w-xs">
          Generating your beautiful study pack...
        </div>
      )}
    </div>
  );
}
