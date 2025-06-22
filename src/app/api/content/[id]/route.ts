import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: audioId } = await params;

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token required" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("❌ Invalid ID token:", error);
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;

    // First, verify the audio file exists and belongs to the user
    const { data: audioFile, error: audioError } = await supabaseAdmin
      .from("audio_files")
      .select("id, uid, original_filename, status")
      .eq("id", audioId)
      .eq("uid", uid)
      .single();

    if (audioError || !audioFile) {
      console.error("❌ Audio file not found or access denied:", audioError);
      return NextResponse.json(
        { success: false, error: "Audio file not found" },
        { status: 404 }
      );
    }

    // Check if learning content already exists for this audio file
    const { data: existingContent, error: contentError } = await supabaseAdmin
      .from("learning_content")
      .select("content")
      .eq("audio_file_id", audioId)
      .eq("uid", uid)
      .single();

    if (existingContent && !contentError) {
      // Return existing content from database
      console.log("✅ Returning existing learning content from database");
      return NextResponse.json({
        success: true,
        data: existingContent.content,
        source: "database",
      });
    }

    // If contentError is not "PGRST116" (no rows found), then it's a real error
    if (contentError && contentError.code !== "PGRST116") {
      console.error(
        "❌ Database error while checking for existing content:",
        contentError
      );
      return NextResponse.json(
        { success: false, error: "Database error" },
        { status: 500 }
      );
    }

    // If no existing content, generate new content (using sample data for now)
    console.log("🎯 No existing content found, generating new content");

    // Get audio file details for content generation
    const audioTitle = audioFile.original_filename.replace(/\.[^/.]+$/, ""); // Remove file extension

    // Sample data that would typically come from OpenAI API generation
    const contentData = {
      audioTitle: audioTitle || "Introduction to Machine Learning - Lecture 1",
      duration: "45 minutes",
      processedAt: new Date().toISOString(),
      summary: {
        professional: {
          title:
            "Comprehensive Guide to Machine Learning Concepts and Applications",
          sections: [
            {
              heading: "What is Machine Learning?",
              content:
                "**Machine Learning (ML)** is a subfield of artificial intelligence (AI) that enables systems to learn from data and improve their performance without being explicitly programmed for every task. It involves designing and training algorithms that can detect patterns, make decisions, and predict outcomes based on input data. ML has become fundamental in fields like computer vision, natural language processing, bioinformatics, and finance due to its ability to automate complex processes and derive insights from massive datasets.",
            },
            {
              heading: "Supervised vs Unsupervised vs Reinforcement Learning",
              content:
                "**Supervised Learning** uses labeled datasets to train models to make predictions or classifications. Common algorithms include decision trees, support vector machines, and neural networks.\n\n**Unsupervised Learning** deals with unlabeled data, aiming to discover hidden patterns or groupings within the dataset. Clustering (e.g., K-means) and dimensionality reduction (e.g., PCA) are typical techniques.\n\n**Reinforcement Learning** trains agents through rewards and penalties to perform tasks in dynamic environments. It's widely used in robotics, game AI, and autonomous systems.",
            },
            {
              heading: "The Machine Learning Pipeline",
              content:
                "A complete ML workflow includes the following steps:\n\n1. **Data Collection** – Gathering structured or unstructured data from various sources.\n2. **Data Preprocessing** – Cleaning, normalizing, and preparing data for analysis.\n3. **Feature Engineering** – Creating meaningful input features to improve model performance.\n4. **Model Selection and Training** – Choosing the appropriate algorithm and training it on the dataset.\n5. **Evaluation** – Assessing performance using metrics like accuracy, precision, recall, F1 score.\n6. **Deployment** – Integrating the model into a live system.\n\nUnderstanding this pipeline is essential for deploying successful ML solutions in production.",
            },
            {
              heading: "Real-World Use Cases",
              content:
                "Machine Learning has revolutionized multiple industries:\n\n- **Healthcare**: Diagnosing diseases from imaging data, predicting patient outcomes\n- **Finance**: Fraud detection, credit scoring, algorithmic trading\n- **Retail & Marketing**: Customer segmentation, recommendation engines\n- **Transportation**: Self-driving vehicles, route optimization\n\nAs data becomes more available and computational power increases, ML will continue to shape innovation across domains.",
            },
          ],
        },
        friendly: {
          title: "Machine Learning Explained in Plain English 😎",
          sections: [
            {
              heading: "What Even Is Machine Learning?",
              content:
                "Think of machine learning as teaching your computer how to figure things out without giving it a list of rules. Instead of saying 'if it has four legs and barks, it's a dog,' you just show it lots of pictures of dogs and it learns the pattern on its own.",
            },
            {
              heading: "Different Ways It Learns",
              content:
                "1. **Supervised learning** is like studying for a test with an answer key. You already know the right answers.\n2. **Unsupervised learning** is like exploring a city without a map—you figure things out as you go.\n3. **Reinforcement learning** is trial and error, like learning to skateboard by falling and getting back up.",
            },
            {
              heading: "Why Should You Care?",
              content:
                "Machine learning is everywhere: your phone's autocorrect, Netflix recommendations, Google Maps traffic predictions. It's making tech smarter so your life gets easier.",
            },
          ],
        },
        eli5: {
          title: "What is Machine Learning? (Explained Like You're 5) 🧸",
          sections: [
            {
              heading: "Learning by Looking",
              content:
                "Imagine your friend shows you 100 pictures of cats and dogs. You start to learn which is which just by seeing a lot of them. That's how a computer learns too!",
            },
            {
              heading: "Types of Learning",
              content:
                "👩‍🏫 **Supervised**: Someone tells the computer, 'This is a cat' or 'This is a dog'.\n🔍 **Unsupervised**: The computer tries to figure it out on its own.\n🎮 **Reinforcement**: The computer gets a reward if it does something right, like a video game!",
            },
            {
              heading: "Where It's Used",
              content:
                "ML helps with things like:\n- Telling Siri what you said 🎤\n- Suggesting videos on YouTube 📹\n- Helping cars drive by themselves 🚗",
            },
          ],
        },
      },
      flashcards: [
        {
          id: 1,
          question: "What is the goal of machine learning?",
          answer:
            "To enable systems to learn from data and improve performance without explicit programming.",
        },
        {
          id: 2,
          question: "What are the three main types of ML?",
          answer:
            "Supervised learning, unsupervised learning, and reinforcement learning.",
        },
        {
          id: 3,
          question: "What does feature engineering involve?",
          answer:
            "Creating new input features from raw data to help the model learn better.",
        },
        {
          id: 4,
          question: "Give an example of a real-world use of ML in healthcare.",
          answer: "ML is used to detect diseases from X-ray and MRI images.",
        },
        {
          id: 5,
          question:
            "What is the difference between supervised and unsupervised learning?",
          answer:
            "Supervised uses labeled data (you know the answer); unsupervised tries to find patterns in unlabeled data.",
        },
      ],
      concepts: [
        {
          term: "Supervised Learning",
          definition:
            "A machine learning approach where the algorithm learns from labeled training data to make predictions on new, unseen data.",
        },
        {
          term: "Training Dataset",
          definition:
            "A collection of data used to teach a machine learning algorithm, containing input features and their corresponding correct outputs.",
        },
        {
          term: "Algorithm",
          definition:
            "A set of rules or instructions that a machine learning model follows to make predictions or decisions based on input data.",
        },
        {
          term: "Cross-Validation",
          definition:
            "A technique used to assess how well a machine learning model generalizes to independent datasets by partitioning data into training and testing subsets.",
        },
        {
          term: "Neural Network",
          definition:
            "A computational model inspired by biological neural networks, consisting of interconnected nodes that process and transmit information.",
        },
        {
          term: "Gradient Descent",
          definition:
            "An optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent.",
        },
      ],
      studyPacks: {
        metadata: {
          title: "Machine Learning Fundamentals",
          subtitle: "Complete Study Guide",
          author: "AI-Generated Content",
          tags: ["Machine Learning", "AI", "Data Science", "Algorithms"],
          duration: "45 minutes",
          level: "Intermediate",
          generatedAt: "2024-01-15T10:30:00Z",
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
          totalPages: 12,
          wordCount: 2847,
          readingTime: "11 min",
          concepts: 6,
          flashcards: 5,
        },
      },
    };

    // Store the generated content in the database for future use
    // Double-check if content was created by another request while we were generating
    const { data: doubleCheckContent, error: doubleCheckError } =
      await supabaseAdmin
        .from("learning_content")
        .select("content")
        .eq("audio_file_id", audioId)
        .eq("uid", uid)
        .single();

    if (doubleCheckContent && !doubleCheckError) {
      // Another request already created the content, return that instead
      console.log(
        "✅ Content was created by another request, returning existing content"
      );
      return NextResponse.json({
        success: true,
        data: doubleCheckContent.content,
        source: "database",
      });
    }

    // Try to insert the content
    try {
      const { error: insertError } = await supabaseAdmin
        .from("learning_content")
        .insert({
          uid,
          audio_file_id: audioId,
          content: contentData,
        });

      if (insertError) {
        // Check if it's a duplicate key error (someone else inserted while we were working)
        if (insertError.code === "23505") {
          // Unique constraint violation
          console.log("🔄 Duplicate detected, fetching existing content");
          const { data: existingAfterError } = await supabaseAdmin
            .from("learning_content")
            .select("content")
            .eq("audio_file_id", audioId)
            .eq("uid", uid)
            .single();

          if (existingAfterError) {
            return NextResponse.json({
              success: true,
              data: existingAfterError.content,
              source: "database",
            });
          }
        }

        console.error("❌ Failed to store learning content:", insertError);
        // Still return the generated content even if storage fails
        return NextResponse.json({
          success: true,
          data: contentData,
          source: "generated",
          warning: "Content not stored in database",
        });
      } else {
        console.log("✅ Learning content stored successfully in database");
        return NextResponse.json({
          success: true,
          data: contentData,
          source: "generated",
        });
      }
    } catch (insertException) {
      console.error("❌ Exception storing learning content:", insertException);
      // Return the generated content anyway
      return NextResponse.json({
        success: true,
        data: contentData,
        source: "generated",
        warning: "Content not stored in database",
      });
    }
  } catch (error) {
    console.error("❌ Content API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
