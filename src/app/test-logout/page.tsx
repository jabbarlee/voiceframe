"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestLogoutPage() {
  const [result, setResult] = useState<string>("");

  const testLogout = async () => {
    try {
      console.log("🧪 Testing logout...");

      // Check cookies before logout
      const cookiesBefore = document.cookie;
      console.log("🍪 Cookies before logout:", cookiesBefore);

      // Call logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      console.log("📋 Logout response:", data);

      // Check cookies after logout
      setTimeout(() => {
        const cookiesAfter = document.cookie;
        console.log("🍪 Cookies after logout:", cookiesAfter);

        setResult(`
          Before: ${cookiesBefore}
          After: ${cookiesAfter}
          Response: ${JSON.stringify(data)}
        `);
      }, 100);
    } catch (error) {
      console.error("❌ Test logout error:", error);
      setResult(`Error: ${error}`);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });

      const data = await response.json();
      console.log("🔍 Auth check:", data);
      setResult(`Auth status: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error("❌ Auth check error:", error);
      setResult(`Auth check error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Logout Test Page</h1>

        <div className="space-y-4">
          <Button onClick={testLogout} className="mr-4">
            Test Logout
          </Button>

          <Button onClick={checkAuth} variant="outline">
            Check Auth Status
          </Button>
        </div>

        {result && (
          <div className="mt-8 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
