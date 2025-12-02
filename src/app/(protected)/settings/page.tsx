"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { User, Bell, Shield, Clock, HardDrive, Loader2, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUserToken } from "@/lib/auth";

interface UserData {
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    renewsOn: string;
    cycleStart?: string;
  };
  usage: {
    transcription: {
      used: number;
      limit: number;
    };
    storage: {
      used: number;
      limit: number;
    };
    audioFiles: number;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);
        const token = await getCurrentUserToken();

        const response = await fetch(`/api/user/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.success && data.profile) {
          setUserData({
            name: data.profile.name || "",
            email: data.profile.email || "",
            avatarUrl: data.profile.avatarUrl,
            createdAt: data.profile.createdAt,
            subscription: data.profile.subscription,
            usage: data.profile.usage,
          });
          setEditedName(data.profile.name || "");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and application settings.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="max-w-4xl">
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {/* Profile Section */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={userData?.name || ""}
                  readOnly
                  className="w-full bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Visit your Profile page to update your name.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.uid || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Email Verification
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.emailVerified
                      ? "Your email is verified"
                      : "Please verify your email"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user?.emailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>

              {userData?.createdAt && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Member since {formatDate(userData.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subscription & Usage Section */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                Subscription & Usage
              </h2>
            </div>

            <div className="space-y-6">
              {/* Current Plan */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {userData?.subscription?.plan || "Free"}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  userData?.subscription?.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {userData?.subscription?.status || "Active"}
                </span>
              </div>

              {/* Transcription Minutes Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-700">
                      Transcription Minutes
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {userData?.usage?.transcription?.used || 0} / {userData?.usage?.transcription?.limit || 30} mins
                  </p>
                </div>
                <Progress
                  value={
                    userData?.usage?.transcription
                      ? (userData.usage.transcription.used / userData.usage.transcription.limit) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>

              {/* Storage Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-700">Storage</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {userData?.usage?.storage?.used?.toFixed(2) || 0} / {userData?.usage?.storage?.limit || 1} GB
                  </p>
                </div>
                <Progress
                  value={
                    userData?.usage?.storage
                      ? (userData.usage.storage.used / userData.usage.storage.limit) * 100
                      : 0
                  }
                  className="h-2 [&>div]:bg-blue-500"
                />
              </div>

              {/* Audio Files Count */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Audio Files</span>
                <span className="font-medium text-gray-900">
                  {userData?.usage?.audioFiles || 0} files
                </span>
              </div>

              {userData?.subscription?.renewsOn && (
                <p className="text-sm text-gray-500">
                  Usage resets on {formatDate(userData.subscription.renewsOn)}
                </p>
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive updates about your transcriptions
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 rounded"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Processing Alerts
                  </p>
                  <p className="text-xs text-gray-500">
                    Get notified when audio processing is complete
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 rounded"
                  defaultChecked
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Change Password
              </Button>

              <Button variant="outline" className="w-full sm:w-auto">
                Download Account Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
