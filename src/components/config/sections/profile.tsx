import { useConfigStore } from "@/context/preferences-context";
import { Camera, Mail, Trash2, Upload, User, WifiOff } from "lucide-react";

export default function ProfileSection() {
  const {
    config,
    setDisplayName,
    setEmail,
    setAvatarPath,
    setOffline,
  } = useConfigStore();
  const { displayName, email } = config;

  return (
    <div className="mb-8 mt-2">
      <div className="space-y-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <hr />
        </div>

        {/* Profile Preview Card */}
        <div className="flex items-center gap-4 py-4">
          <div className="relative group/avatar">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-4 w-4 text-muted-foreground" />
            </label>
          </div>
          <div>
            <div className="text-sm font-semibold">{displayName || "No Name"}</div>
            <div className="text-xs text-muted-foreground">{email || "No Email"}</div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Camera className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Avatar</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Upload a custom avatar image to personalize your profile. Supported formats are JPEG, PNG, and WebP with a maximum size of 2 MB. The image will be cropped to a circle.
              </div>
            </div>
          </div>
          <label className="h-9 px-2 rounded-md border bg-background text-sm hover:bg-accent transition-colors cursor-pointer flex items-center justify-center">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    setAvatarPath(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <User className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Display Name</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Set the name displayed across the application. This name is visible on your profile and in any shared content or activity.
              </div>
            </div>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-9 w-48 rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Mail className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Email Address</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Your email address is used for account recovery, notifications, and login. Changing your email will require verification through a confirmation link.
              </div>
            </div>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-48 rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-4">More Options</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <WifiOff className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Go Offline</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Switch to offline mode to use the application without an internet connection. Note that subscription features require being logged in and connected to the internet — they will be unavailable while offline.
              </div>
            </div>
          </div>
          <button className="h-9 px-4 rounded-md border bg-background text-sm hover:bg-accent transition-colors shrink-0" onClick={() => setOffline(true)}>
            Go Offline
          </button>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Trash2 className="h-4 w-4 text-destructive group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium text-destructive">Delete Account</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                This action cannot be undone. All your dictionaries, progress, and active subscriptions will be immediately cancelled and removed from our servers. Your dictionaries and all local data will still be available though, and you will go offline after deletion.
              </div>
            </div>
          </div>
          <button className="h-9 px-4 rounded-md hover:text-muted-foreground border border-destructive bg-background text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
