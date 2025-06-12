// components/Navbar.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              VoiceFrame
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="#features">
              <Button
                variant="ghost"
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
              >
                Features
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="ghost"
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
              >
                How it works
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                variant="ghost"
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
              >
                Pricing
              </Button>
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm font-medium text-gray-700 hover:text-emerald-600"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
