import {
  CheckCircle2,
  Mic,
  FileText,
  Edit,
  Users,
  Download,
  Shield,
} from "lucide-react";

const features = [
  {
    name: "AI-Powered Transcription",
    description:
      "Upload audio files and get accurate transcriptions in minutes with timestamps.",
    icon: Mic,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Multiple Content Formats",
    description:
      "Generate articles, social posts, show notes, and more from a single recording.",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Smart Editing",
    description:
      "Refine and edit content with AI-powered suggestions and formatting tools.",
    icon: Edit,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Collaboration",
    description:
      "Invite team members to review and edit content together in real-time.",
    icon: Users,
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Export & Publish",
    description:
      "Export in multiple formats or publish directly to your favorite platforms.",
    icon: Download,
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Secure & Private",
    description: "Your content is encrypted and stored securely in the cloud.",
    icon: Shield,
    color: "from-green-500 to-emerald-500",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="w-full py-24 sm:py-32 bg-gradient-to-b from-white via-emerald-50/30 to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:6rem_6rem]"></div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 mb-6">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Powerful Features
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Everything you need to create content{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              faster
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            VoiceFrame combines powerful AI with an intuitive interface to
            streamline your content creation workflow.
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="group relative rounded-2xl bg-white p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg mb-6`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
