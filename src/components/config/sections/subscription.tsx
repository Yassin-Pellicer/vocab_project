import { CreditCard, Check, Crown } from "lucide-react";

export default function SubscriptionSection() {
  const features = [
    "Unlimited dictionaries",
    "Advanced AI features",
    "Priority support",
    "Offline mode",
    "Export to PDF",
    "Custom themes",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Subscription</h2>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      <div className="p-6 rounded-lg border-2 border-primary bg-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Premium Plan</h3>
        </div>
        <div className="mb-4">
          <div className="text-3xl font-bold">$9.99</div>
          <div className="text-sm text-muted-foreground">per month</div>
        </div>
        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <button className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
          Upgrade to Premium
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-sm font-medium">Payment Method</div>
            <div className="text-xs text-muted-foreground">•••• •••• •••• 4242</div>
          </div>
        </div>
      </div>
    </div>
  );
}
