import { Button } from "../../ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full min-h-[80vh] bg-gradient-to-br from-background via-emerald-50/40 to-emerald-100/20">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98114_1px,transparent_1px),linear-gradient(to_bottom,#10b98114_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-100/25 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-50/30 via-transparent to-emerald-100/20"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 relative z-10 flex flex-col items-center justify-center text-center min-h-[80vh]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Turn Your Audio Files Into <br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Ready to use studying content
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Transform audio files into polished study packs, articles, and more
            with AI-powered transcription and content generation.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              asChild
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm"
              asChild
            >
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
