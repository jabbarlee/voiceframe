"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.email}
              </h2>
              <p className="text-gray-600">Member since today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="font-medium text-emerald-900 mb-2">
                Account Status
              </h3>
              <p className="text-emerald-700">Active Premium User</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Usage This Month
              </h3>
              <p className="text-blue-700">2.5 hours of transcription</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
