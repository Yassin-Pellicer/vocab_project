import { Switch } from "@/components/ui/switch";
import { CreditCard, Crown, RefreshCw, Receipt, Bell, XCircle } from "lucide-react";

export default function SubscriptionSection() {
  return (
    <div className="mb-8 mt-2">
      <div className="space-y-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">Subscription</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Crown className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Current Plan</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                View and manage your current subscription plan. Upgrading unlocks unlimited dictionaries, advanced AI features, offline mode, and priority support.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium shrink-0">Free</div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-4">Billing</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Payment Method</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Manage the payment method used for subscription renewals. You can update your card details or switch to a different payment method at any time.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono">•••• 4242</div>
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <RefreshCw className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Auto-Renewal</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Automatically renew your subscription when the current billing period ends. Disabling this will let your plan expire at the end of the cycle without charging you again.
              </div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Receipt className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Email Receipts</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Receive a detailed receipt via email after each payment. Useful for keeping track of your expenses or for reimbursement purposes.
              </div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Bell className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Renewal Reminders</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Get notified a few days before your subscription renews so you have time to review or cancel. Reminders are sent via email and in-app notifications.
              </div>
            </div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <XCircle className="h-4 w-4 text-destructive group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium text-destructive">Cancel Subscription</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Cancel your active subscription at any time. You will retain access to premium features until the end of your current billing period. After that, your account will revert to the free plan.
              </div>
            </div>
          </div>
          <button className="h-9 hover:text-white px-4 rounded-md border border-destructive bg-background text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
