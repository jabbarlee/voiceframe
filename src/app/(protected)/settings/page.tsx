"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and application settings.
        </p>
      </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
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
