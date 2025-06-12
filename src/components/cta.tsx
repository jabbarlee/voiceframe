import { Button } from "./ui/button"
import Link from "next/link"

export function CTA() {
  return (
    <section className="bg-emerald-50 py-24 w-full">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to transform your workflow?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join thousands of creators and professionals who use VoiceFrame to create content faster and more efficiently.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
