"use client";

import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background w-screen overflow-x-hidden">
      <div className="w-full">
        <Navbar />
      </div>
      <main className="flex-1 w-full">
        <div className="w-full">
          <Hero />
          <div id="features" className="w-full">
            <Features />
          </div>
          <div id="how-it-works" className="w-full">
            <HowItWorks />
          </div>
          <div id="pricing" className="w-full">
            <Pricing />
          </div>
        </div>
      </main>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
