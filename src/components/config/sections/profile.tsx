import { User, Mail, Calendar } from "lucide-react";

export default function ProfileSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Your Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
          <User className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">John Doe</h3>
          <p className="text-sm text-muted-foreground">Premium Member</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-sm font-medium">Email</div>
            <div className="text-xs text-muted-foreground">john.doe@example.com</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-sm font-medium">Member Since</div>
            <div className="text-xs text-muted-foreground">January 15, 2024</div>
          </div>
        </div>
      </div>

      <button className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
        Edit Profile
      </button>
    </div>
  );
}
