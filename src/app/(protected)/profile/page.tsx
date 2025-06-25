"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  User,
  CreditCard,
  Key,
  Bell,
  Shield,
  LogOut,
  Copy,
  RefreshCw,
  BarChart,
  Database,
  CheckCircle,
  Edit,
  Calendar,
  FileAudio,
  Clock,
  HardDrive,
  Zap,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserToken } from "@/lib/auth";

// Types based on your database schema
interface UserProfileData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    renewsOn: string;
    stripeCustomerId?: string;
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
  apiKey: string;
  preferences: {
    notifications: {
      productUpdates: boolean;
      weeklySummary: boolean;
      transcriptionComplete: boolean;
    };
    privacy: {
      dataRetention: string;
      analytics: boolean;
    };
  };
  stats: {
    totalTranscriptions: number;
    totalMinutesProcessed: number;
    averageFileSize: number;
    lastActivity: string;
  };
}

// Default data structure
const defaultProfile: UserProfileData = {
  id: "",
  name: "",
  email: "",
  createdAt: new Date().toISOString(),
  subscription: {
    plan: "Free",
    status: "Active",
    renewsOn: new Date().toISOString(),
  },
  usage: {
    transcription: { used: 0, limit: 60 },
    storage: { used: 0, limit: 1 },
    audioFiles: 0,
  },
  apiKey: "",
  preferences: {
    notifications: {
      productUpdates: true,
      weeklySummary: false,
      transcriptionComplete: true,
    },
    privacy: {
      dataRetention: "1year",
      analytics: true,
    },
  },
  stats: {
    totalTranscriptions: 0,
    totalMinutesProcessed: 0,
    averageFileSize: 0,
    lastActivity: new Date().toISOString(),
  },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] =
    useState<UserProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    setTitle("Account Settings");
  }, [setTitle]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await getCurrentUserToken();

        const response = await fetch(`/api/user/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfileData(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Save profile changes
  const saveProfile = async (updates: Partial<UserProfileData>) => {
    if (!user) return;

    try {
      setSaving(true);
      const token = await getCurrentUserToken();

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      setProfileData(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Generate new API key
  const regenerateApiKey = async () => {
    if (!user) return;

    try {
      const token = await getCurrentUserToken();

      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate API key");
      }

      const data = await response.json();
      setProfileData((prev) => ({ ...prev, apiKey: data.apiKey }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to regenerate API key"
      );
    }
  };

  // Copy API key to clipboard
  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(profileData.apiKey);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy API key:", err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-900">
                Account Settings
              </div>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* User Info Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-lg">
                  {getInitials(profileData.name || "User")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {profileData.name || "Loading..."}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {profileData.email}
                </p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Member since {formatDate(profileData.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-1">
              {[
                { id: "profile", label: "Personal Info", icon: User },
                { id: "subscription", label: "Subscription", icon: CreditCard },
                { id: "usage", label: "Usage & Stats", icon: BarChart },
                { id: "api", label: "API Access", icon: Key },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "security", label: "Security", icon: Shield },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="max-w-4xl mx-auto">
              {/* Personal Information Section */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Personal Information
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Update your name and manage your account details.
                    </p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Account Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            Total Transcriptions:
                          </span>
                          <span className="font-semibold ml-1">
                            {profileData.stats.totalTranscriptions}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Minutes Processed:
                          </span>
                          <span className="font-semibold ml-1">
                            {profileData.stats.totalMinutesProcessed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 border-t border-gray-200 text-right rounded-b-xl">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => saveProfile({ name: profileData.name })}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Subscription Section */}
              {activeTab === "subscription" && (
                <div className="space-y-8">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Current Plan
                      </h3>
                      <p className="text-gray-600 mt-1">
                        You are currently on the{" "}
                        <span className="font-semibold text-emerald-600">
                          {profileData.subscription.plan}
                        </span>{" "}
                        plan.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                profileData.subscription.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {profileData.subscription.status}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            {profileData.subscription.plan !== "Free" && (
                              <>
                                Renews on{" "}
                                {formatDate(profileData.subscription.renewsOn)}
                              </>
                            )}
                          </p>
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          {profileData.subscription.plan === "Free"
                            ? "Upgrade Plan"
                            : "Manage Subscription"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage & Stats Section */}
              {activeTab === "usage" && (
                <div className="space-y-8">
                  {/* Current Usage */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Current Usage
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Track your consumption of included resources this month.
                      </p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-700">
                              Transcription Minutes
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {profileData.usage.transcription.used} /{" "}
                            {profileData.usage.transcription.limit} mins
                          </p>
                        </div>
                        <Progress
                          value={
                            (profileData.usage.transcription.used /
                              profileData.usage.transcription.limit) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <HardDrive className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-700">
                              Storage
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {profileData.usage.storage.used.toFixed(1)} /{" "}
                            {profileData.usage.storage.limit} GB
                          </p>
                        </div>
                        <Progress
                          value={
                            (profileData.usage.storage.used /
                              profileData.usage.storage.limit) *
                            100
                          }
                          className="h-2 [&>div]:bg-blue-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <FileAudio className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-700">
                              Audio Files
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {profileData.usage.audioFiles} files
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Account Statistics
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Your usage history and statistics.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-emerald-600 text-sm font-medium">
                                Total Transcriptions
                              </p>
                              <p className="text-2xl font-bold text-emerald-900">
                                {profileData.stats.totalTranscriptions}
                              </p>
                            </div>
                            <Zap className="h-8 w-8 text-emerald-600" />
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-600 text-sm font-medium">
                                Minutes Processed
                              </p>
                              <p className="text-2xl font-bold text-blue-900">
                                {profileData.stats.totalMinutesProcessed}
                              </p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-600 text-sm font-medium">
                                Avg File Size
                              </p>
                              <p className="text-2xl font-bold text-purple-900">
                                {formatFileSize(
                                  profileData.stats.averageFileSize
                                )}
                              </p>
                            </div>
                            <Database className="h-8 w-8 text-purple-600" />
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-600 text-sm font-medium">
                                Last Activity
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                {formatDate(profileData.stats.lastActivity)}
                              </p>
                            </div>
                            <Calendar className="h-8 w-8 text-gray-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Key Section */}
              {activeTab === "api" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      API Access
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Use this key to integrate VoiceFrame with your
                      applications.
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <Key className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Coming Soon
                      </h4>
                      <p className="text-gray-600 text-center max-w-md">
                        API access and developer tools are currently in
                        development. Stay tuned for updates!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Notification Preferences
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Choose how and when you want to be notified.
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <Bell className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Coming Soon
                      </h4>
                      <p className="text-gray-600 text-center max-w-md">
                        Notification settings are being developed. We'll notify
                        you when this feature is available!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeTab === "security" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Security Settings
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Manage your password and account security.
                    </p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Password
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Keep your account secure with a strong password.
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Privacy Settings
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-800">
                              Analytics
                            </h5>
                            <p className="text-sm text-gray-600">
                              Help us improve by sharing anonymous usage data.
                            </p>
                          </div>
                          <Switch
                            checked={profileData.preferences.privacy.analytics}
                            onCheckedChange={(checked: boolean) => {
                              const updated = {
                                ...profileData,
                                preferences: {
                                  ...profileData.preferences,
                                  privacy: {
                                    ...profileData.preferences.privacy,
                                    analytics: checked,
                                  },
                                },
                              };
                              setProfileData(updated);
                              saveProfile({ preferences: updated.preferences });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-red-200 pt-6">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Danger Zone
                      </h4>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all of your data.
                        This action cannot be undone.
                      </p>
                      <Button variant="destructive">Delete My Account</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
