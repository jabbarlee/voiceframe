"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication status...");
      console.log("🍪 Current cookies:", document.cookie);

      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });

      console.log("📋 Auth response status:", response.status);

      if (!response.ok) {
        console.log("❌ Authentication failed, redirecting to login");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      console.log("✅ Authentication successful:", data);
      setUser(data.user);
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      console.log("📋 Logout response:", data);

      router.push("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Still redirect even if there's an error
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Dashboard
              </h1>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-800">
                  <strong>Welcome, {user.email}!</strong>
                </p>
                <p className="text-emerald-600 text-sm mt-1">
                  User ID: {user.uid}
                </p>
                <p className="text-emerald-600 text-sm">
                  Email Verified: {user.emailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              Sign Out
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Session Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Session is active and valid. You are successfully authenticated
                with Firebase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
