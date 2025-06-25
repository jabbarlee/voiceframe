"use client";

import { usePageTitle } from "@/components/layout/PageTitleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getCurrentUserToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowLeft,
  Loader2,
  Clock,
  Zap,
  Crown,
  Star,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserUsage {
  id: string;
  uid: string;
  plan: string;
  allowed_minutes: number;
  used_minutes: number;
  cycle_start: string;
  remaining_minutes: number;
  is_over_limit: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  minutes: number;
  hours: number;
  popular?: boolean;
  recommended?: boolean;
  features: string[];
  color: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    text: string;
  };
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    minutes: 30,
    hours: 0.5,
    features: [
      "30 minutes of transcription",
      "Basic AI content generation",
      "Export to common formats",
      "Email support",
    ],
    color: {
      primary: "bg-gray-50",
      secondary: "bg-gray-100",
      accent: "bg-gray-600",
      border: "border-gray-200",
      text: "text-gray-900",
    },
  },
  {
    id: "starter",
    name: "Starter",
    price: 10,
    minutes: 600,
    hours: 10,
    popular: true,
    features: [
      "600 minutes of transcription",
      "Advanced AI content generation",
      "Multiple export formats",
      "Priority email support",
      "Custom templates",
    ],
    color: {
      primary: "bg-blue-50",
      secondary: "bg-blue-100",
      accent: "bg-blue-600",
      border: "border-blue-200",
      text: "text-blue-900",
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 20,
    minutes: 1500,
    hours: 25,
    recommended: true,
    features: [
      "1500 minutes of transcription",
      "Premium AI content generation",
      "All export formats",
      "Priority support & phone",
      "Advanced templates",
      "API access",
      "Team collaboration",
    ],
    color: {
      primary: "bg-emerald-50",
      secondary: "bg-emerald-100",
      accent: "bg-emerald-600",
      border: "border-emerald-200",
      text: "text-emerald-900",
    },
  },
];

export default function PricingPage() {
  const { setTitle } = usePageTitle();
  const { user } = useAuth();
  const router = useRouter();

  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Upgrade Plan");
  }, [setTitle]);

  // Fetch user usage data
  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;

      try {
        setIsLoadingUsage(true);
        const idToken = await getCurrentUserToken();

        const response = await fetch("/api/usage", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserUsage(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchUsage();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user || !userUsage) return;

    setUpgradingPlan(planId);
    setError(null);

    try {
      const idToken = await getCurrentUserToken();
      if (!idToken) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/user/upgrade/plan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPlan: planId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upgrade plan");
      }

      // Update local state
      setUserUsage(data.data);

      // Show success and redirect after delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Upgrade error:", error);
      setError(error.message || "Failed to upgrade plan");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    if (hours % 1 === 0) {
      return `${hours} hours`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  // Show loading while waiting for auth state
  if (user === undefined || isLoadingUsage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-4">Please sign in to view pricing</p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
            {/* Left side - Back button */}
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>

            {/* Center - Page title */}
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Choose Your Plan
              </h1>
              <p className="text-sm text-gray-600">
                Upgrade to unlock more transcription minutes
              </p>
            </div>

            {/* Right side - Empty for balance */}
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Transform More Audio with VoiceFrame
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your transcription needs. Upgrade or
              downgrade anytime with no commitments.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isCurrentPlan = userUsage?.plan === plan.id;
              const isUpgrading = upgradingPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl ${plan.color.primary} ${
                    plan.color.border
                  } border-2 p-6 transition-all duration-200 hover:shadow-lg flex flex-col h-full ${
                    plan.recommended
                      ? "ring-2 ring-emerald-500 ring-opacity-50"
                      : ""
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div className="absolute -top-3 right-4">
                      <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Crown className="h-3 w-3" />
                        <span>Recommended</span>
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${plan.color.secondary} mb-4`}
                    >
                      {plan.id === "free" && (
                        <Clock className={`h-7 w-7 ${plan.color.text}`} />
                      )}
                      {plan.id === "starter" && (
                        <Zap className={`h-7 w-7 ${plan.color.text}`} />
                      )}
                      {plan.id === "pro" && (
                        <Crown className={`h-7 w-7 ${plan.color.text}`} />
                      )}
                    </div>
                    <h3 className={`text-xl font-bold ${plan.color.text} mb-2`}>
                      {plan.name}
                    </h3>
                    <div className="mb-3">
                      <span className={`text-3xl font-bold ${plan.color.text}`}>
                        ${plan.price}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <div
                      className={`text-base font-semibold ${plan.color.text}`}
                    >
                      {formatHours(plan.hours)} of transcription
                    </div>
                    <div className="text-sm text-gray-600">
                      ({plan.minutes} minutes)
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6 flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check
                            className={`h-4 w-4 ${plan.color.text} flex-shrink-0 mt-0.5`}
                          />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <div
                        className={`w-full py-3 px-4 ${plan.color.secondary} ${plan.color.border} border rounded-lg text-center`}
                      >
                        <span className={`font-medium ${plan.color.text}`}>
                          Current Plan
                        </span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isUpgrading}
                        className={`w-full ${plan.color.accent} hover:opacity-90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200`}
                      >
                        {isUpgrading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Upgrading...</span>
                          </div>
                        ) : (
                          <span>
                            {userUsage && userUsage.plan === "free"
                              ? "Upgrade to"
                              : userUsage &&
                                plans.find((p) => p.id === userUsage.plan)
                                  ?.price! > plan.price
                              ? "Downgrade to"
                              : "Upgrade to"}{" "}
                            {plan.name}
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
