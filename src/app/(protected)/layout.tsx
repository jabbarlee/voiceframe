import { AuthProvider } from "@/components/auth/AuthProvider";
import { Sidebar } from "@/components/ui/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                VoiceFrame
              </h1>
              <div className="flex items-center space-x-4">
                {/* We'll add user menu here later */}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
