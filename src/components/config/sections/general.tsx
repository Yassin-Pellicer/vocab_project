import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Moon, Brush } from "lucide-react";
import useConfig from "../hooks";

export default function GeneralSection() {
  const {
    preferences,
    setNotifications,
    setNotificationLifetime,
    setAccentColor,
    setAppearance,
  } = useConfig();

  return (
    <div className="mb-8 mt-2">
      <div className="space-y-2">
        <div>
          <h2 className="text-xl font-semibold mb-2">General</h2>
          <hr></hr>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between rounded-md  group gap-4">
            <div className="flex py-2 items-center flex-1 gap-4">
              <div className="flex-1 gap-4">
                <div className="flex flex-row gap-2 items-center mb-1">
                  <Bell className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                  <div className="text-sm font-medium">Notifications</div>
                </div>
                <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                  Get notified about your progress. Notifications will appear on
                  the edges of the application. Desktop notifications are not
                  supported yet.
                </div>
              </div>
            </div>
            <Switch checked={preferences.notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex flex-row items-center mt-4">
            <div className="text-sm font-medium w-full">
              Notification lifetime
            </div>
            <Select value={preferences.notificationLifetime} onValueChange={setNotificationLifetime}>
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
          <h2 className="text-xl font-semibold mb-2 mt-4">Looks and Feel</h2>
          <hr></hr>
        </div>

        <div className="flex items-center justify-between   rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Brush className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Accent color</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Choose the accent color used throughout the application to match
                your personal style. This will affect buttons, highlights, and
                other UI elements.
              </div>
            </div>
          </div>
          <Select value={preferences.accentColor} onValueChange={setAccentColor}>
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

        <div className="flex items-center justify-between   rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Moon className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Appearance</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Customize the look and feel of the application. Choose between
                light and dark modes.
              </div>
            </div>
          </div>
          <Select
            value={preferences.appearance || "system"}
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
      </div>
    </div>
  );
}
