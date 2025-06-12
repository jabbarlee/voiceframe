import { Button } from "./ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative w-full py-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent"></div>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Ready to transform your workflow?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50">
            Join thousands of creators and professionals who use VoiceFrame to
            create content faster and more efficiently.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold shadow-lg"
              asChild
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-emerald-600 font-semibold"
              asChild
            >
              <Link href="/demo">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
