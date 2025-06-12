import { CheckCircle2 } from "lucide-react";

const features = [
  {
    name: "AI-Powered Transcription",
    description:
      "Upload audio files and get accurate transcriptions in minutes with timestamps.",
  },
  {
    name: "Multiple Content Formats",
    description:
      "Generate articles, social posts, show notes, and more from a single recording.",
  },
  {
    name: "Smart Editing",
    description:
      "Refine and edit content with AI-powered suggestions and formatting tools.",
  },
  {
    name: "Collaboration",
    description:
      "Invite team members to review and edit content together in real-time.",
  },
  {
    name: "Export & Publish",
    description:
      "Export in multiple formats or publish directly to your favorite platforms.",
  },
  {
    name: "Secure & Private",
    description: "Your content is encrypted and stored securely in the cloud.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="w-full py-24 sm:py-32 bg-white border-t border-gray-100"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to create content faster
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            VoiceFrame combines powerful AI with an intuitive interface to
            streamline your content creation workflow.
          </p>
        </div>

        <div className="w-full max-w-5xl mx-auto mt-16">
          <div className="w-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-200"
              >
                <div className="absolute -top-4 left-6 rounded-full bg-emerald-100 p-1.5 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="mt-2 text-lg font-semibold">{feature.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
