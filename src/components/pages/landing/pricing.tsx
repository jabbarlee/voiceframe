import { CheckIcon, Star, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "../../ui/button";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Get started with basic features at no cost.",
    icon: Sparkles,
    features: [
      "30 minutes of transcription/month",
      "3 AI content generations",
      "Basic editing tools",
      "PDF export",
      "Community support",
    ],
    buttonText: "Get Started Free",
    popular: false,
    gradient: "from-gray-500 to-slate-500",
  },
  {
    name: "Starter",
    price: 10,
    description:
      "Perfect for individuals getting started with content creation.",
    icon: Zap,
    features: [
      "5 hours of transcription/month",
      "10 AI content generations",
      "Basic editing tools",
      "PDF & DOCX export",
      "Email support",
    ],
    buttonText: "Get Started",
    popular: false,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro",
    price: 25,
    description: "For professionals who create content regularly.",
    icon: Star,
    features: [
      "15,000 minutes of transcription/month",
      "Unlimited AI content generations",
      "Advanced editing tools",
      "Team collaboration",
      "Priority support",
      "Custom branding",
    ],
    buttonText: "Start Free Trial",
    popular: true,
    gradient: "from-emerald-500 to-teal-500",
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="w-full py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)]"></div>

      <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="w-full max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 mb-6">
            <Star className="mr-2 h-4 w-4" />
            Pricing Plans
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Simple,{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Choose the plan that works best for your content creation needs.
          </p>
        </div>

        <div className="w-full flex flex-wrap justify-center gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 w-full sm:w-[400px] flex-shrink-0 ${
                plan.popular
                  ? "bg-white shadow-2xl border-2 border-emerald-200 scale-105 hover:scale-110"
                  : "bg-white shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                    <Star className="mr-1 h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan icon */}
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${plan.gradient} text-white shadow-lg mb-6`}
              >
                <plan.icon className="h-7 w-7" />
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold">
                      {typeof plan.price === "number"
                        ? `$${plan.price}`
                        : plan.price}
                    </span>
                    {typeof plan.price === "number" && (
                      <span className="text-xl text-muted-foreground ml-2">
                        /month
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  className={`w-full mb-8 whitespace-nowrap ${
                    plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  What's included:
                </h4>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <CheckIcon className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom gradient accent */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient} rounded-b-3xl`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
