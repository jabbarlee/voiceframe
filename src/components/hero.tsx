import { Button } from "./ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Turn Your Voice Into <br />
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
            Publish-Ready Content
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Transform audio files into polished articles, social posts, and more with AI-powered transcription and content generation.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#demo">Watch Demo</Link>
          </Button>
        </div>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-background/80 to-background" />
    </section>
  )
}
