"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { Sidebar } from "@/components/ui/Sidebar";
import { PageTitleProvider } from "@/components/layout/PageTitleProvider";
import { Header } from "@/components/layout/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <PageTitleProvider>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </PageTitleProvider>
    </AuthProvider>
  );
}
