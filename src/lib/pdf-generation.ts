import jsPDF from "jspdf";

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

type SummaryTone = "professional" | "friendly" | "eli5";
type StudyPackTemplate = "academic" | "modern" | "minimal" | "creative";

interface PDFGenerationOptions {
  template: StudyPackTemplate;
  includeSummary: boolean;
  summaryTone: SummaryTone;
  includeFlashcards: boolean;
  includeConcepts: boolean;
  includeMetadata: boolean;
}

class PDFGenerator {
  private doc: jsPDF;
  private currentY: number;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private contentWidth: number;

  constructor() {
    this.doc = new jsPDF();
    this.currentY = 20;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = 20;
    this.contentWidth = this.pageWidth - this.margin * 2;
  }

  generateStudyPack(
    contentData: ContentData,
    options: PDFGenerationOptions
  ): Uint8Array {
    try {
      // Reset document
      this.doc = new jsPDF();
      this.currentY = 20;

      // Apply template styling
      this.applyTemplateStyle(options.template);

      // Generate title page
      this.generateTitlePage(contentData, options);

      // Add table of contents
      this.addNewPage();
      this.generateTableOfContents(options);

      // Generate content sections
      if (options.includeSummary) {
        this.addNewPage();
        this.generateSummarySection(contentData.summary[options.summaryTone]);
      }

      if (options.includeFlashcards) {
        this.addNewPage();
        this.generateFlashcardsSection(contentData.flashcards);
      }

      if (options.includeConcepts) {
        this.addNewPage();
        this.generateConceptsSection(contentData.concepts);
      }

      if (options.includeMetadata) {
        this.addNewPage();
        this.generateMetadataSection(contentData);
      }

      // Add footer to all pages
      this.addFooters(contentData);

      // Return PDF as Uint8Array for download
      return this.doc.output("arraybuffer") as Uint8Array;
    } catch (error) {
      console.error("❌ PDF generation failed:", error);
      throw new Error(
        `PDF generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private applyTemplateStyle(template: StudyPackTemplate) {
    // Set colors and fonts based on template
    switch (template) {
      case "academic":
        this.doc.setTextColor(25, 25, 112); // Dark blue
        break;
      case "modern":
        this.doc.setTextColor(124, 58, 237); // Purple
        break;
      case "minimal":
        this.doc.setTextColor(75, 85, 99); // Gray
        break;
      case "creative":
        this.doc.setTextColor(16, 185, 129); // Emerald
        break;
    }
  }

  private generateTitlePage(
    contentData: ContentData,
    options: PDFGenerationOptions
  ) {
    // Title
    this.doc.setFontSize(28);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText(contentData.audioTitle, this.currentY, "center");
    this.currentY += 20;

    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "normal");
    this.addWrappedText(
      contentData.studyPacks.metadata.subtitle,
      this.currentY,
      "center"
    );
    this.currentY += 15;

    // Decorative line
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY
    );
    this.currentY += 30;

    // Metadata box
    const boxY = this.currentY;
    const boxHeight = 60;

    // Background box
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.margin, boxY, this.contentWidth, boxHeight, "F");

    // Metadata content
    this.currentY = boxY + 15;
    this.doc.setFontSize(12);

    const metadata = [
      `Duration: ${contentData.duration}`,
      `Generated: ${new Date(contentData.processedAt).toLocaleDateString()}`,
      `Level: ${contentData.studyPacks.metadata.level}`,
      `Author: ${contentData.studyPacks.metadata.author}`,
      `Source: ${
        contentData.studyPacks.metadata.sourceType || "Audio Transcription"
      }`,
      ...(contentData.studyPacks.stats.studyTime
        ? [`Study Time: ${contentData.studyPacks.stats.studyTime}`]
        : []),
    ];

    metadata.forEach((text) => {
      this.addWrappedText(text, this.currentY, "center");
      this.currentY += 8;
    });

    // Tags
    this.currentY += 10;
    this.doc.setFontSize(10);
    const tagsText = `Tags: ${contentData.studyPacks.metadata.tags.join(", ")}`;
    this.addWrappedText(tagsText, this.currentY, "center");

    // Study pack info
    this.currentY += 40;
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Study Pack Contents", this.currentY, "center");

    this.currentY += 15;
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");

    const contents = [];
    if (options.includeSummary)
      contents.push(`✓ Summary Notes (${options.summaryTone} tone)`);
    if (options.includeFlashcards)
      contents.push(`✓ ${contentData.flashcards.length} Flashcards`);
    if (options.includeConcepts)
      contents.push(`✓ ${contentData.concepts.length} Key Concepts`);

    contents.forEach((text) => {
      this.addWrappedText(text, this.currentY, "center");
      this.currentY += 8;
    });
  }

  private generateTableOfContents(options: PDFGenerationOptions) {
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Table of Contents", this.currentY);
    this.currentY += 20;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");

    let pageNum = 3; // Start after title page and TOC
    const tocItems = [];

    if (options.includeSummary) {
      tocItems.push({
        title: `Summary Notes (${options.summaryTone})`,
        page: pageNum++,
      });
    }
    if (options.includeFlashcards) {
      tocItems.push({ title: "Flashcards", page: pageNum++ });
    }
    if (options.includeConcepts) {
      tocItems.push({ title: "Key Concepts", page: pageNum++ });
    }
    if (options.includeMetadata) {
      tocItems.push({ title: "Study Metadata", page: pageNum++ });
    }

    tocItems.forEach((item) => {
      const dots = ".".repeat(Math.max(1, 60 - item.title.length));
      this.addWrappedText(`${item.title} ${dots} ${item.page}`, this.currentY);
      this.currentY += 10;
    });
  }

  private generateSummarySection(summary: {
    title: string;
    sections: { heading: string; content: string }[];
  }) {
    // Section header
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Summary Notes", this.currentY);
    this.currentY += 15;

    // Summary title
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText(summary.title, this.currentY);
    this.currentY += 15;

    // Summary sections
    summary.sections.forEach((section) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 50) {
        this.addNewPage();
      }

      // Section heading
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.addWrappedText(section.heading, this.currentY);
      this.currentY += 10;

      // Section content
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "normal");

      // Clean up content (remove markdown)
      const cleanContent = section.content
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/• /g, "• ");

      this.addWrappedText(cleanContent, this.currentY);
      this.currentY += 15;
    });
  }

  private generateFlashcardsSection(
    flashcards: { id: number; question: string; answer: string }[]
  ) {
    // Section header
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Flashcards", this.currentY);
    this.currentY += 20;

    flashcards.forEach((card, index) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage();
      }

      // Card number
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.addWrappedText(`Card ${card.id}`, this.currentY);
      this.currentY += 10;

      // Question
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "bold");
      this.addWrappedText("Q: " + card.question, this.currentY);
      this.currentY += 8;

      // Answer
      this.doc.setFont("helvetica", "normal");
      this.addWrappedText("A: " + card.answer, this.currentY);
      this.currentY += 15;

      // Separator line (except for last card)
      if (index < flashcards.length - 1) {
        this.doc.setLineWidth(0.1);
        this.doc.line(
          this.margin,
          this.currentY,
          this.pageWidth - this.margin,
          this.currentY
        );
        this.currentY += 10;
      }
    });
  }

  private generateConceptsSection(
    concepts: { term: string; definition: string; category: string }[]
  ) {
    // Section header
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Key Concepts", this.currentY);
    this.currentY += 20;

    // Group concepts by category
    const groupedConcepts = concepts.reduce((groups, concept) => {
      if (!groups[concept.category]) {
        groups[concept.category] = [];
      }
      groups[concept.category].push(concept);
      return groups;
    }, {} as Record<string, typeof concepts>);

    Object.entries(groupedConcepts).forEach(([category, categoryConcepts]) => {
      // Category header
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.addWrappedText(category, this.currentY);
      this.currentY += 12;

      categoryConcepts.forEach((concept) => {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 40) {
          this.addNewPage();
        }

        // Term
        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "bold");
        this.addWrappedText(`• ${concept.term}`, this.currentY);
        this.currentY += 8;

        // Definition
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "normal");
        this.addWrappedText(concept.definition, this.currentY, "left", 25); // Indent definition
        this.currentY += 12;
      });

      this.currentY += 5; // Space between categories
    });
  }

  private generateMetadataSection(contentData: ContentData) {
    // Section header
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Study Metadata", this.currentY);
    this.currentY += 20;

    // Statistics
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Statistics", this.currentY);
    this.currentY += 12;

    const stats = [
      `Total Pages: ${contentData.studyPacks.stats.totalPages}`,
      `Word Count: ${contentData.studyPacks.stats.wordCount.toLocaleString()}`,
      `Reading Time: ${contentData.studyPacks.stats.readingTime}`,
      ...(contentData.studyPacks.stats.studyTime
        ? [`Study Time: ${contentData.studyPacks.stats.studyTime}`]
        : []),
      `Concepts: ${contentData.studyPacks.stats.concepts}`,
      `Flashcards: ${contentData.studyPacks.stats.flashcards}`,
      ...(contentData.studyPacks.stats.sections
        ? [`Sections: ${contentData.studyPacks.stats.sections}`]
        : []),
    ];

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    stats.forEach((stat) => {
      this.addWrappedText(`• ${stat}`, this.currentY);
      this.currentY += 8;
    });

    this.currentY += 10;

    // Generation info
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.addWrappedText("Generation Information", this.currentY);
    this.currentY += 12;

    const genInfo = [
      `Generated: ${new Date(contentData.processedAt).toLocaleString()}`,
      `Source: ${contentData.audioTitle}`,
      `Duration: ${contentData.duration}`,
      `Level: ${contentData.studyPacks.metadata.level}`,
      `Content Type: ${
        contentData.studyPacks.metadata.sourceType || "Audio Transcription"
      }`,
      ...(contentData.studyPacks.metadata.wordComplexity
        ? [`Complexity: ${contentData.studyPacks.metadata.wordComplexity}`]
        : []),
    ];

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    genInfo.forEach((info) => {
      this.addWrappedText(`• ${info}`, this.currentY);
      this.currentY += 8;
    });
  }

  private addWrappedText(
    text: string,
    y: number,
    align: "left" | "center" | "right" = "left",
    leftIndent: number = 0
  ) {
    const maxWidth = this.contentWidth - leftIndent;
    const x =
      align === "center" ? this.pageWidth / 2 : this.margin + leftIndent;

    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string, index: number) => {
      this.doc.text(line, x, y + index * 5, { align: align });
    });

    this.currentY = y + lines.length * 5;
  }

  private addNewPage() {
    this.doc.addPage();
    this.currentY = 20;
  }

  private addFooters(contentData: ContentData) {
    const totalPages = this.doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      // Page number
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `${i} / ${totalPages}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: "right" }
      );

      // Footer text
      this.doc.text(
        `Generated from: ${contentData.audioTitle}`,
        this.margin,
        this.pageHeight - 10,
        { align: "left" }
      );
    }
  }
}

export function generateStudyPackPDF(
  contentData: ContentData,
  options: PDFGenerationOptions
): Uint8Array {
  const generator = new PDFGenerator();
  return generator.generateStudyPack(contentData, options);
}

export type { PDFGenerationOptions, SummaryTone, StudyPackTemplate };
