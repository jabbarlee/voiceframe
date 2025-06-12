import { Upload, Mic, FileText, Share2 } from "lucide-react";

const steps = [
  {
    name: "Upload Audio",
    description: "Record or upload your audio file in MP3, M4A, or WAV format.",
    icon: Upload,
  },
  {
    name: "Get Transcript",
    description:
      "Our AI transcribes your audio with timestamps and speaker identification.",
    icon: Mic,
  },
  {
    name: "Generate Content",
    description:
      "Choose from multiple content formats and let AI create the first draft.",
    icon: FileText,
  },
  {
    name: "Edit & Share",
    description: "Refine your content and share or export it with your team.",
    icon: Share2,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-gray-50 py-24 border-t border-gray-200"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How VoiceFrame Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Turn your spoken words into polished content in just a few simple
            steps.
          </p>
        </div>

        <div className="w-full max-w-5xl mx-auto mt-16">
          <div className="w-full grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.name}
                className="relative text-center bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    <span className="mr-2 text-emerald-600">0{index + 1}.</span>
                    {step.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
