import { Upload, Mic, FileText, Share2, ArrowRight } from "lucide-react";

const steps = [
  {
    name: "Upload Audio",
    description: "Record or upload your audio file in MP3, M4A, or WAV format.",
    icon: Upload,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Get Transcript",
    description:
      "Our AI transcribes your audio with timestamps and speaker identification.",
    icon: Mic,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Generate Content",
    description:
      "Choose from multiple content formats and let AI create the first draft.",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Edit & Share",
    description: "Refine your content and share or export it with your team.",
    icon: Share2,
    color: "from-orange-500 to-red-500",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-gradient-to-b from-white via-gray-50/50 to-white py-24 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6b728008_1px,transparent_1px),linear-gradient(to_bottom,#6b728008_1px,transparent_1px)] bg-[size:6rem_6rem]"></div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 mb-6">
            <ArrowRight className="mr-2 h-4 w-4" />
            Simple Process
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            How{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              VoiceFrame
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Turn your spoken words into polished content in just a few simple
            steps.
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.name} className="group relative">
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-14 left-full w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0"></div>
                )}

                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    {/* Step number */}
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${step.color} text-white shadow-lg`}
                      >
                        <step.icon className="h-7 w-7" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                      {step.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${step.color} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
