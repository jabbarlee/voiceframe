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
  BarChart,
  Database,
  Calendar,
  FileAudio,
  Clock,
  HardDrive,
  Zap,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserToken } from "@/lib/auth";

// Types based on database schema (users, user_usage, audio_files tables)
interface UserProfileData {
  id: string;
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
  avatarUrl: null,
  createdAt: new Date().toISOString(),
  subscription: {
    plan: "Free",
    status: "Active",
    renewsOn: new Date().toISOString(),
    cycleStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  },
  usage: {
    transcription: { used: 0, limit: 30 },
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

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState<UserProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    setTitle("Settings");
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
        if (data.success && data.profile) {
          setProfileData(data.profile);
        }
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
      setError(null);
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
      if (data.profile) {
        setProfileData(data.profile);
      }
      setSuccessMessage("Changes saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-gray-500">Loading settings...</p>
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
              <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* User Info Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold">
                  {getInitials(profileData.name || user?.email || "User")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate text-sm">
                  {profileData.name || user?.email?.split("@")[0] || "User"}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  {profileData.email || user?.email}
                </p>
                <div className="flex items-center mt-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    profileData.subscription.plan === "Free"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {profileData.subscription.plan} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-3 overflow-y-auto">
            <nav className="space-y-1">
              {[
                { id: "profile", label: "Personal Info", icon: User },
                { id: "subscription", label: "Subscription", icon: CreditCard },
                { id: "usage", label: "Usage & Stats", icon: BarChart },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "security", label: "Security", icon: Shield },
                { id: "api", label: "API Access", icon: Key },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
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

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
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
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg max-w-3xl mx-auto flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <p className="text-emerald-800 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="max-w-3xl mx-auto">
              {/* Personal Information Section */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Personal Information
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Update your name and manage your account details.
                    </p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
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
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        User ID
                      </label>
                      <Input
                        type="text"
                        value={user?.uid || ""}
                        disabled
                        className="bg-gray-50 font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
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
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          user?.emailVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user?.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member since {formatDate(profileData.createdAt)}
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-xl">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => saveProfile({ name: profileData.name })}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Subscription Section */}
              {activeTab === "subscription" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Current Plan
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm">
                        Manage your subscription and billing.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Your Plan</p>
                          <p className="text-2xl font-bold text-emerald-800 mt-1">
                            {profileData.subscription.plan}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                profileData.subscription.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {profileData.subscription.status}
                            </span>
                            {profileData.subscription.plan !== "Free" && (
                              <span className="text-xs text-gray-600">
                                Renews {formatDate(profileData.subscription.renewsOn)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => router.push("/pricing")}
                        >
                          {profileData.subscription.plan === "Free"
                            ? "Upgrade Plan"
                            : "Manage Plan"}
                        </Button>
                      </div>

                      {/* Plan Features */}
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Monthly Minutes</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {profileData.usage.transcription.limit} mins
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <HardDrive className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Storage</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {profileData.usage.storage.limit} GB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage & Stats Section */}
              {activeTab === "usage" && (
                <div className="space-y-6">
                  {/* Current Usage */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Current Usage
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm">
                        Track your consumption of included resources this billing cycle.
                      </p>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Transcription Minutes */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <h4 className="font-medium text-gray-700">
                              Transcription Minutes
                            </h4>
                          </div>
                          <p className="text-sm font-medium">
                            <span className="text-emerald-600">{profileData.usage.transcription.used}</span>
                            <span className="text-gray-400"> / {profileData.usage.transcription.limit} mins</span>
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
                        <p className="text-xs text-gray-500 mt-1">
                          {profileData.usage.transcription.limit - profileData.usage.transcription.used} minutes remaining
                        </p>
                      </div>

                      {/* Storage */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <HardDrive className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-gray-700">Storage</h4>
                          </div>
                          <p className="text-sm font-medium">
                            <span className="text-blue-600">{profileData.usage.storage.used.toFixed(2)}</span>
                            <span className="text-gray-400"> / {profileData.usage.storage.limit} GB</span>
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

                      {/* Audio Files */}
                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileAudio className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-gray-700">Total Audio Files</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {profileData.usage.audioFiles} files
                        </span>
                      </div>

                      <p className="text-sm text-gray-500">
                        Usage resets on {formatDate(profileData.subscription.renewsOn)}
                      </p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Account Statistics
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm">
                        Your all-time usage history.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-emerald-600 text-xs font-medium uppercase tracking-wide">
                                Total Transcriptions
                              </p>
                              <p className="text-2xl font-bold text-emerald-900 mt-1">
                                {profileData.stats.totalTranscriptions}
                              </p>
                            </div>
                            <Zap className="h-8 w-8 text-emerald-500" />
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-600 text-xs font-medium uppercase tracking-wide">
                                Minutes Processed
                              </p>
                              <p className="text-2xl font-bold text-blue-900 mt-1">
                                {profileData.stats.totalMinutesProcessed}
                              </p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-600 text-xs font-medium uppercase tracking-wide">
                                Avg File Size
                              </p>
                              <p className="text-2xl font-bold text-purple-900 mt-1">
                                {formatFileSize(profileData.stats.averageFileSize)}
                              </p>
                            </div>
                            <Database className="h-8 w-8 text-purple-500" />
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                                Last Activity
                              </p>
                              <p className="text-lg font-bold text-gray-900 mt-1">
                                {formatDate(profileData.stats.lastActivity)}
                              </p>
                            </div>
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      </div>
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
                    <p className="text-gray-600 mt-1 text-sm">
                      Choose how and when you want to be notified.
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Transcription Complete
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified when your audio processing is done
                        </p>
                      </div>
                      <Switch
                        checked={profileData.preferences.notifications.transcriptionComplete}
                        onCheckedChange={(checked: boolean) => {
                          const updated = {
                            ...profileData,
                            preferences: {
                              ...profileData.preferences,
                              notifications: {
                                ...profileData.preferences.notifications,
                                transcriptionComplete: checked,
                              },
                            },
                          };
                          setProfileData(updated);
                        }}
                      />
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Product Updates
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive updates about new features and improvements
                        </p>
                      </div>
                      <Switch
                        checked={profileData.preferences.notifications.productUpdates}
                        onCheckedChange={(checked: boolean) => {
                          const updated = {
                            ...profileData,
                            preferences: {
                              ...profileData.preferences,
                              notifications: {
                                ...profileData.preferences.notifications,
                                productUpdates: checked,
                              },
                            },
                          };
                          setProfileData(updated);
                        }}
                      />
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Weekly Summary
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get a weekly summary of your transcription activity
                        </p>
                      </div>
                      <Switch
                        checked={profileData.preferences.notifications.weeklySummary}
                        onCheckedChange={(checked: boolean) => {
                          const updated = {
                            ...profileData,
                            preferences: {
                              ...profileData.preferences,
                              notifications: {
                                ...profileData.preferences.notifications,
                                weeklySummary: checked,
                              },
                            },
                          };
                          setProfileData(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-xl">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => saveProfile({ preferences: profileData.preferences })}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Security Settings
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm">
                        Manage your password and account security.
                      </p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Password</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Keep your account secure with a strong password.
                        </p>
                        <Button variant="outline">Change Password</Button>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Privacy Settings</h4>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <h5 className="font-medium text-gray-800">Analytics</h5>
                            <p className="text-sm text-gray-500">
                              Help us improve by sharing anonymous usage data
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

                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Data</h4>
                        <Button variant="outline">Download Account Data</Button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-xl border border-red-200 shadow-sm">
                    <div className="p-6 border-b border-red-200 bg-red-50 rounded-t-xl">
                      <h3 className="text-xl font-semibold text-red-800">
                        Danger Zone
                      </h3>
                      <p className="text-red-700 mt-1 text-sm">
                        Irreversible and destructive actions.
                      </p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete your account and all of your data. This action cannot be undone.
                      </p>
                      <Button variant="destructive">Delete My Account</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* API Access Section */}
              {activeTab === "api" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      API Access
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Use this key to integrate VoiceFrame with your applications.
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
                      <p className="text-gray-500 text-center max-w-md text-sm">
                        API access and developer tools are currently in development. 
                        Stay tuned for updates!
                      </p>
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
