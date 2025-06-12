"use client";

import { Navbar } from "@/components/pages/landing/navbar";
import { Pricing } from "@/components/pages/landing/pricing";
import { Hero } from "@/components/pages/landing/hero";
import { Features } from "@/components/pages/landing/features";
import { HowItWorks } from "@/components/pages/landing/how-it-works";
import { Footer } from "@/components/pages/landing/footer";

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
