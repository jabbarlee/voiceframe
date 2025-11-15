import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranscriptInput {
  audioId: string;
  audioTitle: string;
  transcript: string;
  duration: string;
  processedAt: string;
  transcriptMetadata?: {
    wordCount?: number;
    processingTime?: number;
    model?: string;
  };
}

interface ContentData {
  audioTitle: string;
  duration: string;
  processedAt: string;
  summary: {
    professional: {
      title: string;
      sections: { heading: string; content: string }[];
    };
    friendly: {
      title: string;
      sections: { heading: string; content: string }[];
    };
    eli5: {
      title: string;
      sections: { heading: string; content: string }[];
    };
  };
  flashcards: { id: number; question: string; answer: string }[];
  concepts: { term: string; definition: string; category: string }[];
  studyPacks: {
    metadata: {
      title: string;
      subtitle: string;
      author: string;
      tags: string[];
      duration: string;
      level: string;
      generatedAt: string;
    };
    templates: {
      id: string;
      name: string;
      description: string;
      preview: string;
      color: string;
      features: string[];
    }[];
    stats: {
      totalPages: number;
      wordCount: number;
      readingTime: string;
      concepts: number;
      flashcards: number;
    };
  };
}

export async function generateContentFromTranscript(
  input: TranscriptInput
): Promise<ContentData> {
  try {
    console.log("🤖 Generating content from transcript for:", input.audioId);

    // Run all generation tasks in parallel for efficiency
    const [summaryData, flashcardsData, conceptsData] = await Promise.all([
      generateSummaries(input.transcript, input.audioTitle),
      generateFlashcards(input.transcript),
      generateConcepts(input.transcript),
    ]);

    // Generate study pack metadata
    const studyPackData = generateStudyPackMetadata(
      input,
      flashcardsData.length,
      conceptsData.length
    );

    const contentData: ContentData = {
      audioTitle: input.audioTitle,
      duration: input.duration,
      processedAt: input.processedAt,
      summary: summaryData,
      flashcards: flashcardsData,
      concepts: conceptsData,
      studyPacks: studyPackData,
    };

    console.log("✅ Content generation completed successfully");
    return contentData;
  } catch (error) {
    console.error("❌ Content generation failed:", error);
    throw new Error(
      `Content generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function generateSummaries(transcript: string, title: string) {
  const summaryPrompts = {
    professional: `Create a comprehensive professional summary of this transcript. Make it detailed, formal, and suitable for academic or professional use. Use markdown formatting for emphasis.

Transcript: ${transcript}`,
    friendly: `Create a friendly, conversational summary of this transcript. Make it approachable, use casual language, and include emojis where appropriate.

Transcript: ${transcript}`,
    eli5: `Create an "Explain Like I'm 5" summary of this transcript. Use very simple language, analogies, and examples a child would understand.

Transcript: ${transcript}`,
  };

  try {
    const [professional, friendly, eli5] = await Promise.all([
      generateSummaryTone(summaryPrompts.professional),
      generateSummaryTone(summaryPrompts.friendly),
      generateSummaryTone(summaryPrompts.eli5),
    ]);

    return {
      professional,
      friendly,
      eli5,
    };
  } catch (error) {
    console.error("❌ Summary generation failed:", error);
    throw error;
  }
}

async function generateSummaryTone(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content:
          "You are an expert content creator. Generate structured summary content based on the transcript provided.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "summary_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title for this summary tone",
            },
            sections: {
              type: "array",
              description: "Array of sections with headings and content",
              items: {
                type: "object",
                properties: {
                  heading: {
                    type: "string",
                    description: "The section heading",
                  },
                  content: {
                    type: "string",
                    description: "The section content with markdown formatting",
                  },
                },
                required: ["heading", "content"],
                additionalProperties: false,
              },
            },
          },
          required: ["title", "sections"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No summary content generated");

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("❌ Failed to parse summary JSON:", content);
    throw new Error("Invalid JSON response from AI");
  }
}

async function generateFlashcards(transcript: string) {
  const prompt = `Create educational flashcards from this transcript. Create 5-8 flashcards covering the most important concepts. Make questions test understanding, not just memorization.

Transcript: ${transcript}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content:
          "You are an educational content expert. Generate flashcards from the provided transcript.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "flashcards_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              description: "Array of flashcard objects",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    description: "Sequential ID starting from 1",
                  },
                  question: {
                    type: "string",
                    description: "Clear, specific question",
                  },
                  answer: {
                    type: "string",
                    description: "Comprehensive answer",
                  },
                },
                required: ["id", "question", "answer"],
                additionalProperties: false,
              },
            },
          },
          required: ["flashcards"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.6,
    max_tokens: 1500,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No flashcards content generated");

  try {
    const parsed = JSON.parse(content);
    return parsed.flashcards;
  } catch (parseError) {
    console.error("❌ Failed to parse flashcards JSON:", content);
    throw new Error("Invalid JSON response from AI");
  }
}

async function generateConcepts(transcript: string) {
  const prompt = `Extract key concepts and terms from this transcript. Extract 6-10 of the most important concepts with clear definitions and appropriate categories.

Transcript: ${transcript}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content:
          "You are a knowledge extraction expert. Extract key concepts from the provided transcript.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "concepts_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            concepts: {
              type: "array",
              description: "Array of concept objects",
              items: {
                type: "object",
                properties: {
                  term: {
                    type: "string",
                    description: "The important term or concept",
                  },
                  definition: {
                    type: "string",
                    description: "Clear, concise definition",
                  },
                  category: {
                    type: "string",
                    description: "Category this concept belongs to",
                  },
                },
                required: ["term", "definition", "category"],
                additionalProperties: false,
              },
            },
          },
          required: ["concepts"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.5,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No concepts content generated");

  try {
    const parsed = JSON.parse(content);
    return parsed.concepts;
  } catch (parseError) {
    console.error("❌ Failed to parse concepts JSON:", content);
    throw new Error("Invalid JSON response from AI");
  }
}

function generateStudyPackMetadata(
  input: TranscriptInput,
  flashcardCount: number,
  conceptCount: number
) {
  // Extract key topics for tags (simplified approach)
  const words = input.transcript.toLowerCase().split(" ");
  const commonWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
  ];
  const significantWords = words
    .filter((word) => word.length > 4 && !commonWords.includes(word))
    .reduce((acc: { [key: string]: number }, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  const topicTags = Object.entries(significantWords)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 4)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  // Estimate reading time (average 200 words per minute)
  const wordCount = input.transcript.split(" ").length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);

  return {
    metadata: {
      title: input.audioTitle,
      subtitle: "Complete Study Guide",
      author: "AI-Generated Content",
      tags: topicTags,
      duration: input.duration,
      level:
        wordCount > 2000
          ? "Advanced"
          : wordCount > 1000
          ? "Intermediate"
          : "Beginner",
      generatedAt: input.processedAt,
    },
    templates: [
      {
        id: "academic",
        name: "Academic Paper",
        description: "Clean, scholarly design with proper citations",
        preview: "/api/placeholder/300/400",
        color: "blue",
        features: ["Table of Contents", "References", "Clean Typography"],
      },
      {
        id: "modern",
        name: "Modern Magazine",
        description: "Sleek, contemporary layout with visual elements",
        preview: "/api/placeholder/300/400",
        color: "purple",
        features: ["Visual Elements", "Modern Layout", "Color Accents"],
      },
      {
        id: "minimal",
        name: "Minimal Clean",
        description: "Simple, distraction-free design for focus",
        preview: "/api/placeholder/300/400",
        color: "gray",
        features: ["Minimal Design", "High Readability", "Clean Spacing"],
      },
      {
        id: "creative",
        name: "Creative Studio",
        description: "Vibrant, engaging design with illustrations",
        preview: "/api/placeholder/300/400",
        color: "emerald",
        features: ["Illustrations", "Vibrant Colors", "Engaging Layout"],
      },
    ],
    stats: {
      totalPages: Math.ceil(wordCount / 300), // Estimate pages
      wordCount,
      readingTime: `${readingTimeMinutes} min`,
      concepts: conceptCount,
      flashcards: flashcardCount,
    },
  };
}

export function estimateContentGenerationCost(
  transcriptLength: number
): number {
  // Estimate based on OpenAI pricing for GPT-4o-mini
  // Rough calculation: ~4 API calls with varying token counts
  const inputTokens = transcriptLength * 0.7; // Rough word-to-token ratio
  const outputTokens = 3000; // Estimated total output tokens

  const inputCost = (inputTokens / 1000) * 0.00015; // $0.150 per 1K input tokens
  const outputCost = (outputTokens / 1000) * 0.0006; // $0.600 per 1K output tokens

  return (inputCost + outputCost) * 4; // 4 API calls
}
