import { Heart, Coffee, DollarSign } from "lucide-react";

export default function DonateSection() {
  const donationTiers = [
    { amount: 5, label: "Buy me a coffee", icon: Coffee },
    { amount: 10, label: "Support development", icon: Heart },
    { amount: 25, label: "Become a sponsor", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Donate</h2>
        <p className="text-sm text-muted-foreground">
          Support the development of this project
        </p>
      </div>

      <div className="p-6 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <Heart className="h-8 w-8 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
        <p className="text-sm text-muted-foreground">
          Your support helps us continue developing and maintaining this project. Every contribution makes a difference and is greatly appreciated.
        </p>
      </div>

      <div className="space-y-3">
        {donationTiers.map((tier, index) => {
          const Icon = tier.icon;
          return (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-accent hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{tier.label}</div>
                  <div className="text-xs text-muted-foreground">${tier.amount}</div>
                </div>
              </div>
              <div className="text-lg font-semibold">${tier.amount}</div>
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-lg border bg-card">
        <div className="text-sm font-medium mb-2">Custom Amount</div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Enter amount"
            className="flex-1 p-2 rounded-md border bg-background text-sm"
            min="1"
          />
          <button className="py-2 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            Donate
          </button>
        </div>
      </div>
    </div>
  );
}
