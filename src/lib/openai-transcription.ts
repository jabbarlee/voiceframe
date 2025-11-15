import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Configuration for different transcription models
 * Using the most cost-effective models while maintaining good quality
 */
export const TRANSCRIPTION_MODELS = {
  // Most cost-effective option
  WHISPER_1: "whisper-1",
  // Higher quality options (more expensive)
  GPT_4O_MINI_TRANSCRIBE: "gpt-4o-mini-transcribe",
  GPT_4O_TRANSCRIBE: "gpt-4o-transcribe",
  // For diarization (speaker identification)
  GPT_4O_TRANSCRIBE_DIARIZE: "gpt-4o-transcribe-diarize",
} as const;

export type TranscriptionModel =
  (typeof TRANSCRIPTION_MODELS)[keyof typeof TRANSCRIPTION_MODELS];

export interface TranscriptionOptions {
  model?: TranscriptionModel;
  language?: string;
  prompt?: string;
  response_format?:
    | "json"
    | "text"
    | "srt"
    | "verbose_json"
    | "vtt"
    | "diarized_json";
  temperature?: number;
  timestamp_granularities?: ("word" | "segment")[];
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: any[];
  words?: any[];
}

export interface TranscriptionCostEstimate {
  estimatedCostUSD: number;
  fileSizeMB: number;
  estimatedMinutes: number;
  model: TranscriptionModel;
}

/**
 * Estimate the cost of transcribing an audio file
 * Whisper-1 pricing: $0.006 per minute
 * GPT-4o models: varies, typically higher
 */
export function estimateTranscriptionCost(
  fileSizeBytes: number,
  fileType: string,
  model: TranscriptionModel = TRANSCRIPTION_MODELS.WHISPER_1
): TranscriptionCostEstimate {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  // Rough estimation based on file size and type
  // This is an approximation - actual duration may vary
  let estimatedMinutes: number;

  switch (fileType.toLowerCase()) {
    case "audio/mp3":
    case "audio/mpeg":
      // MP3 is compressed, roughly 1MB per minute at 128kbps
      estimatedMinutes = fileSizeMB;
      break;
    case "audio/wav":
      // WAV is uncompressed, roughly 10MB per minute at 44.1kHz/16bit
      estimatedMinutes = fileSizeMB / 10;
      break;
    case "audio/m4a":
    case "audio/aac":
      // AAC/M4A compressed, similar to MP3
      estimatedMinutes = fileSizeMB * 1.2;
      break;
    case "audio/ogg":
    case "audio/webm":
      // OGG/WebM compressed
      estimatedMinutes = fileSizeMB * 1.1;
      break;
    default:
      // Default estimation
      estimatedMinutes = fileSizeMB;
  }

  // Apply cost per minute based on model
  let costPerMinute: number;
  switch (model) {
    case TRANSCRIPTION_MODELS.WHISPER_1:
      costPerMinute = 0.006; // $0.006 per minute
      break;
    case TRANSCRIPTION_MODELS.GPT_4O_MINI_TRANSCRIBE:
      costPerMinute = 0.012; // Estimated - check latest pricing
      break;
    case TRANSCRIPTION_MODELS.GPT_4O_TRANSCRIBE:
      costPerMinute = 0.024; // Estimated - check latest pricing
      break;
    case TRANSCRIPTION_MODELS.GPT_4O_TRANSCRIBE_DIARIZE:
      costPerMinute = 0.036; // Estimated - check latest pricing
      break;
    default:
      costPerMinute = 0.006;
  }

  const estimatedCostUSD = Math.max(0.001, estimatedMinutes * costPerMinute);

  return {
    estimatedCostUSD,
    fileSizeMB,
    estimatedMinutes: Math.max(0.1, estimatedMinutes),
    model,
  };
}

/**
 * Check if file size is within OpenAI limits (25MB)
 */
export function validateFileForTranscription(
  fileSizeBytes: number,
  mimeType: string
): {
  isValid: boolean;
  error?: string;
} {
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB

  if (fileSizeBytes > maxSizeBytes) {
    return {
      isValid: false,
      error: `File too large for transcription. Maximum size is 25MB, but file is ${(
        fileSizeBytes /
        (1024 * 1024)
      ).toFixed(1)}MB.`,
    };
  }

  const supportedTypes = [
    "audio/mp3",
    "audio/mpeg",
    "audio/mp4",
    "audio/m4a",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/aac",
  ];

  if (!supportedTypes.includes(mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: `Unsupported file type: ${mimeType}. Supported types: ${supportedTypes.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

/**
 * Transcribe an audio file using OpenAI's Speech-to-Text API
 */
export async function transcribeAudio(
  audioBuffer: Buffer | File,
  filename: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    const {
      model = TRANSCRIPTION_MODELS.WHISPER_1, // Use cheapest model by default
      language,
      prompt,
      response_format = "verbose_json",
      temperature,
      timestamp_granularities,
    } = options;

    console.log(`🎙️ Starting transcription with model: ${model}`);
    console.log(`📁 File: ${filename}`);

    // Convert Buffer to File if needed
    const file =
      audioBuffer instanceof File
        ? audioBuffer
        : new File([new Uint8Array(audioBuffer)], filename);

    // Prepare the transcription request
    const transcriptionParams: any = {
      file,
      model,
    };

    // Add optional parameters
    if (language) transcriptionParams.language = language;
    if (prompt) transcriptionParams.prompt = prompt;
    if (response_format) transcriptionParams.response_format = response_format;
    if (temperature !== undefined)
      transcriptionParams.temperature = temperature;
    if (timestamp_granularities)
      transcriptionParams.timestamp_granularities = timestamp_granularities;

    const startTime = Date.now();

    // Make the API call
    const transcription = await openai.audio.transcriptions.create(
      transcriptionParams
    );

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`✅ Transcription completed in ${processingTime}ms`);

    // Handle different response formats
    let result: TranscriptionResult;

    if (typeof transcription === "string") {
      // Simple text response
      result = { text: transcription };
    } else if (response_format === "verbose_json" && "text" in transcription) {
      // Verbose JSON response with metadata
      const transcriptionData = transcription as any;
      result = {
        text: transcriptionData.text,
        language: transcriptionData.language,
        duration: transcriptionData.duration,
        segments: transcriptionData.segments,
        words: transcriptionData.words,
      };
    } else {
      // Default case
      result = { text: (transcription as any).text || String(transcription) };
    }

    console.log(`📊 Transcription stats:`);
    console.log(`- Text length: ${result.text.length} characters`);
    console.log(`- Word count: ${result.text.split(" ").length} words`);
    if (result.duration) console.log(`- Duration: ${result.duration} seconds`);
    if (result.language) console.log(`- Detected language: ${result.language}`);

    return result;
  } catch (error) {
    console.error("❌ Transcription error:", error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        throw new Error(
          "API rate limit exceeded. Please try again in a moment."
        );
      }
      if (error.message.includes("insufficient_quota")) {
        throw new Error(
          "API quota exceeded. Please check your OpenAI account billing."
        );
      }
      if (error.message.includes("file_too_large")) {
        throw new Error("Audio file is too large. Maximum size is 25MB.");
      }
      if (error.message.includes("invalid_file_type")) {
        throw new Error(
          "Invalid audio file format. Please use MP3, WAV, M4A, OGG, AAC, or WebM."
        );
      }
    }

    throw new Error(
      `Transcription failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Transcribe audio with streaming support for real-time feedback
 * Note: Streaming is limited in current OpenAI API - fallback to regular transcription
 */
export async function transcribeAudioStreaming(
  audioBuffer: Buffer | File,
  filename: string,
  options: TranscriptionOptions = {},
  onProgress?: (chunk: string) => void
): Promise<TranscriptionResult> {
  try {
    console.log(
      `🎙️ Attempting streaming transcription (will fallback to regular if unavailable)`
    );

    // For now, simulate streaming by doing regular transcription
    // and calling onProgress with chunks of the result
    const result = await transcribeAudio(audioBuffer, filename, {
      ...options,
      response_format: "text",
    });

    if (onProgress) {
      // Simulate streaming by sending the text in chunks
      const text = result.text;
      const chunkSize = 50; // characters per chunk

      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        onProgress(chunk);
        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Simulated streaming transcription completed`);
    return result;
  } catch (error) {
    console.error("❌ Streaming transcription error:", error);
    throw error;
  }
}

/**
 * Get recommended model based on requirements
 */
export function getRecommendedModel(requirements: {
  needsSpeakerDiarization?: boolean;
  prioritizeCost?: boolean;
  needsHighQuality?: boolean;
  needsStreaming?: boolean;
}): TranscriptionModel {
  const {
    needsSpeakerDiarization,
    prioritizeCost,
    needsHighQuality,
    needsStreaming,
  } = requirements;

  // Speaker diarization requires specific model
  if (needsSpeakerDiarization) {
    return TRANSCRIPTION_MODELS.GPT_4O_TRANSCRIBE_DIARIZE;
  }

  // Prioritize cost-effectiveness
  if (prioritizeCost && !needsHighQuality) {
    return TRANSCRIPTION_MODELS.WHISPER_1;
  }

  // For streaming, only certain models work
  if (needsStreaming) {
    return TRANSCRIPTION_MODELS.GPT_4O_MINI_TRANSCRIBE;
  }

  // High quality requirements
  if (needsHighQuality) {
    return TRANSCRIPTION_MODELS.GPT_4O_TRANSCRIBE;
  }

  // Default to cost-effective option
  return TRANSCRIPTION_MODELS.WHISPER_1;
}

export default {
  transcribeAudio,
  transcribeAudioStreaming,
  estimateTranscriptionCost,
  validateFileForTranscription,
  getRecommendedModel,
  TRANSCRIPTION_MODELS,
};
