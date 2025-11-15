import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  generateStudyPackPDF,
  type PDFGenerationOptions,
  type SummaryTone,
  type StudyPackTemplate,
} from "@/lib/pdf-generation";

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
      sourceType?: string;
      wordComplexity?: string;
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
      studyTime?: string;
      concepts: number;
      flashcards: number;
      sections?: number;
    };
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: audioId } = await params;
    console.log(`📄 POST /api/content/${audioId}/pdf - Generating PDF`);

    // Get auth token from headers
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization header required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    console.log(`✅ Authenticated user: ${userId}`);

    // Parse request body
    const body = await request.json();
    const {
      template = "academic",
      includeSummary = true,
      summaryTone = "professional",
      includeFlashcards = true,
      includeConcepts = true,
      includeMetadata = true,
    } = body as {
      template?: StudyPackTemplate;
      includeSummary?: boolean;
      summaryTone?: SummaryTone;
      includeFlashcards?: boolean;
      includeConcepts?: boolean;
      includeMetadata?: boolean;
    };

    const options: PDFGenerationOptions = {
      template,
      includeSummary,
      summaryTone,
      includeFlashcards,
      includeConcepts,
      includeMetadata,
    };

    console.log(`📋 PDF options:`, options);

    // Check if audio file exists and belongs to user
    const { data: audioFile, error: audioError } = await supabaseAdmin
      .from("audio_files")
      .select("id, original_filename, file_size_bytes, created_at, uid")
      .eq("id", audioId)
      .eq("uid", userId)
      .single();

    if (audioError || !audioFile) {
      console.log(`❌ Audio file not found or access denied:`, audioError);
      return NextResponse.json(
        { success: false, error: "Audio file not found or access denied" },
        { status: 404 }
      );
    }

    // Get existing learning content
    const { data: existingContent, error: contentError } = await supabaseAdmin
      .from("learning_content")
      .select("content")
      .eq("audio_file_id", audioId)
      .eq("uid", userId)
      .single();

    if (contentError || !existingContent) {
      console.log(`❌ Learning content not found:`, contentError);
      return NextResponse.json(
        {
          success: false,
          error: "Learning content not found. Please generate content first.",
        },
        { status: 404 }
      );
    }

    // Handle both JSON string and object formats for backward compatibility
    let contentData: ContentData;
    if (typeof existingContent.content === "string") {
      try {
        contentData = JSON.parse(existingContent.content);
      } catch (error) {
        console.error("❌ Failed to parse content JSON:", error);
        return NextResponse.json(
          { success: false, error: "Invalid content format" },
          { status: 500 }
        );
      }
    } else {
      contentData = existingContent.content as ContentData;
    }

    // Ensure we have the required data for PDF generation
    if (
      !contentData.summary ||
      !contentData.flashcards ||
      !contentData.concepts
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Incomplete content data. Please regenerate content.",
        },
        { status: 400 }
      );
    }

    console.log(
      `📄 Generating PDF with ${contentData.flashcards.length} flashcards, ${contentData.concepts.length} concepts`
    );

    // Generate PDF
    const pdfBuffer = generateStudyPackPDF(contentData, options);

    // Generate filename
    const sanitizedTitle = audioFile.original_filename
      .replace(/\.[^/.]+$/, "") // Remove file extension
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .slice(0, 50); // Limit length

    const filename = `${sanitizedTitle}_study_pack_${template}.pdf`;

    console.log(
      `✅ PDF generated successfully: ${filename} (${pdfBuffer.byteLength} bytes)`
    );

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: `PDF generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
