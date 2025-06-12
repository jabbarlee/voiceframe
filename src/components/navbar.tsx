// components/Navbar.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-gray-900">
              VoiceFrame
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="#features">
              <Button variant="ghost" className="text-sm font-medium">
                Features
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" className="text-sm font-medium">
                How it works
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="ghost" className="text-sm font-medium">
                Pricing
              </Button>
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="outline" className="text-sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm bg-black text-white hover:bg-neutral-800">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
