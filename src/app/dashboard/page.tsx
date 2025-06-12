import { getUserFromRequest } from "@/lib/getUser";
import { redirectToLogin } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getUserFromRequest();

  if (!user) {
    await redirectToLogin();
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
            <form>
              <Button
                type="submit"
                variant="outline"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                Sign Out
              </Button>
            </form>
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
