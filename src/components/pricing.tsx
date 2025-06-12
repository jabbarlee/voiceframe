import { CheckIcon } from "lucide-react"
import { Button } from "./ui/button"

const plans = [
  {
    name: "Starter",
    price: 19,
    description: "Perfect for individuals getting started with content creation.",
    features: [
      "5 hours of transcription/month",
      "10 AI content generations",
      "Basic editing tools",
      "PDF & DOCX export",
      "Email support",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 49,
    description: "For professionals who create content regularly.",
    features: [
      "20 hours of transcription/month",
      "Unlimited AI content generations",
      "Advanced editing tools",
      "Team collaboration",
      "Priority support",
      "Custom branding",
    ],
    buttonText: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs.",
    features: [
      "Custom transcription limits",
      "Unlimited AI content generations",
      "Advanced security & compliance",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & priority support",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="w-full py-24">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that works best for your content creation needs.
          </p>
        </div>

        <div className="w-full max-w-5xl mx-auto mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular ? "border-emerald-500 ring-2 ring-emerald-200" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-800">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-muted-foreground">{plan.description}</p>
              <div className="mt-6">
                <p className="text-4xl font-bold">
                  {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
                  {typeof plan.price === "number" && <span className="text-lg font-normal text-muted-foreground">/mo</span>}
                </p>
                <Button className="mt-6 w-full" size="lg" variant={plan.popular ? "default" : "outline"}>
                  {plan.buttonText}
                </Button>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
