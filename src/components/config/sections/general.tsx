import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Moon,
  Brush,
  Camera,
  Mail,
  Trash2,
  UnplugIcon,
  Upload,
  User,
  WifiOff,
  X,
} from "lucide-react";
import { PreferencesContext } from "@/context/preferences-context";
import { Button } from "@/components/ui/button";
import { useProfileSection } from "../hooks";

export default function GeneralSection() {
  const {
    config,
    setNotifications,
    setNotificationLifetime,
    setAccentColor,
    setAppearance,
    setOffline,
  } = PreferencesContext();

  const {
    draftDisplayName,
    draftEmail,
    setDraftDisplayName,
    setDraftEmail,
    avatarDataUrl,
    avatarFile,
    avatarRemoved,
    onAvatarFile,
    removeAvatar,
    fileInputRef,
    dirty,
    saving,
    error,
    handleConfirm,
    signOut,
    user
  } = useProfileSection();

  const hasAvatar = !!avatarDataUrl || !!avatarFile;

  return (
    <div className="mb-8 mt-2">
      <div className="space-y-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <hr />
        </div>

        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group/avatar">
              {avatarDataUrl ? (
                <img
                  src={avatarDataUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
              )}
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                aria-label="Pick avatar image"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div>
              <div className="text-sm font-semibold">{draftDisplayName || "No Name"}</div>
              <div className="text-xs text-muted-foreground">{draftEmail || "No Email"}</div>
              {avatarFile && !avatarRemoved ? (
                <div className="text-xs text-muted-foreground mt-1">
                  New image selected — save to apply
                </div>
              ) : null}
              {avatarRemoved ? (
                <div className="text-xs text-muted-foreground mt-1">
                  Avatar will be removed — save to apply
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end sm:justify-start">
            <Button type="button" disabled={!dirty || saving} onClick={() => void handleConfirm()}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Camera className="h-4 w-4 text-muted-foreground transition-colors" />
                <div className="text-sm font-medium">Avatar</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Upload a custom avatar image to personalize your profile. Supported formats are
                JPEG, PNG, and WebP with a maximum size of 2 MB. The image is stored only on this
                device with your preferences.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasAvatar && (
              <button
                type="button"
                onClick={removeAvatar}
                className="h-9 px-2 rounded-md border bg-background text-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors flex items-center justify-center"
                aria-label="Remove avatar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <label className="h-9 px-2 rounded-md border bg-background text-sm hover:bg-accent transition-colors cursor-pointer flex items-center justify-center">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  onAvatarFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md group">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center">
                <User className="h-4 w-4 text-muted-foreground transition-colors" />
                <div className="text-sm font-medium">Display Name</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Set the name displayed across the application. This name is visible on your profile
                and in any shared content or activity.
              </div>
            </div>
          </div>
          <input
            type="text"
            value={draftDisplayName}
            onChange={(e) => setDraftDisplayName(e.target.value)}
            className="h-9 w-48 rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Mail className="h-4 w-4 text-muted-foreground transition-colors" />
                <div className="text-sm font-medium">Email Address</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Your email address is used for account recovery, notifications, and login. Changing
                your email will require verification through a confirmation link.
              </div>
            </div>
          </div>
          <input
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            className="h-9 w-48 rounded-md border bg-background px-3 text-sm"
          />
        </div>

        {error ? <p className="text-xs text-destructive pt-1">{error}</p> : null}

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-6!">General</h2>
          <hr />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between rounded-md group gap-4">
            <div className="flex py-2 items-center flex-1 gap-4">
              <div className="flex-1 gap-4">
                <div className="flex flex-row gap-2 items-center mb-1">
                  <Bell className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div className="text-sm font-medium">Notifications</div>
                </div>
                <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                  Get notified about your progress. Notifications will appear on the edges of the
                  application. Desktop notifications are not supported yet.
                </div>
              </div>
            </div>
            <Switch checked={config.notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex flex-row items-center">
            <div className="text-sm font-medium w-full">Notification lifetime</div>
            <Select value={config.notificationLifetime} onValueChange={setNotificationLifetime}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3s">3 seconds</SelectItem>
                <SelectItem value="5s">5 seconds</SelectItem>
                <SelectItem value="7s">7 seconds</SelectItem>
                <SelectItem value="10s">10 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-6!">Looks and Feel</h2>
          <hr />
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Brush className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Accent color</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Choose the accent color used throughout the application to match your personal
                style. This will affect buttons, highlights, and other UI elements.
              </div>
            </div>
          </div>
          <Select value={config.accentColor} onValueChange={setAccentColor}>
            <SelectTrigger className="">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span>Blue</span>
                </div>
              </SelectItem>
              <SelectItem value="red">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span>Red</span>
                </div>
              </SelectItem>
              <SelectItem value="green">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span>Green</span>
                </div>
              </SelectItem>
              <SelectItem value="purple">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500" />
                  <span>Purple</span>
                </div>
              </SelectItem>
              <SelectItem value="orange">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500" />
                  <span>Orange</span>
                </div>
              </SelectItem>
              <SelectItem value="yellow">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500" />
                  <span>Yellow</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Moon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Appearance</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Customize the look and feel of the application. Choose between light and dark modes.
              </div>
            </div>
          </div>
          <Select
            value={config.appearance || "system"}
            onValueChange={(v) => setAppearance(v as "light" | "dark" | "system")}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Select appearance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System default</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {user && <div>
          <h2 className="text-xl font-semibold mb-2 mt-6!">More Options</h2>
          <hr />
        </div>}

        {user && <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <WifiOff className="h-4 w-4 text-muted-foreground transition-colors" />
                <div className="text-sm font-medium">Go Offline</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Switch to offline mode to use the application without an internet connection. Note
                that subscription features require being logged in and connected to the internet —
                they will be unavailable while offline.
              </div>
            </div>
          </div>
          <Button onClick={() => { setOffline(true); void signOut(); }}>
            <UnplugIcon /> Go Offline
          </Button>
        </div>}

        {user && <div className="flex items-center justify-between rounded-md group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Trash2 className="h-4 w-4 text-destructive transition-colors" />
                <div className="text-sm font-medium text-destructive">Delete Account</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                This action cannot be undone. All your dictionaries, progress, and active
                subscriptions will be immediately cancelled and removed from our servers. Your
                dictionaries and all local data will still be available though, and you will go
                offline after deletion.
              </div>
            </div>
          </div>
          <Button variant={"destructive"}>
            Delete
          </Button>
        </div>}     
      </div>
    </div>
  );
}