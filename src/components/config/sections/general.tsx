import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Moon, Save, Globe, FerrisWheel, Brush } from "lucide-react";
import { useConfigStore } from "@/context/preferences-context";

export default function GeneralSection() {
  const appearance = useConfigStore((s) => s.appearance);
  const setAppearance = useConfigStore((s) => s.setAppearance);
  const dateFormat = useConfigStore((s) => s.dateFormat);
  const setDateFormat = useConfigStore((s) => s.setDateFormat);

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
            <Switch defaultChecked />
          </div>
          <div className="flex flex-row items-center mt-4">
            <div className="text-sm font-medium w-full">
              Notification lifetime
            </div>
            <Select defaultValue="5s">
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
          <h2 className="text-xl font-semibold mb-2 mt-4">Language and time</h2>
          <hr></hr>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Globe className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Language</div>
              </div>
              <p className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Select your preferred language for the application interface.
                Can't find your language? Help us translate!
              </p>
              <a
                href="https://example.com/translate"
                className="text-xs underline text-blue-600 hover:text-blue-800"
              >
                Contribute to translations
              </a>
            </div>
          </div>
          <Select defaultValue="en">
            <SelectTrigger className="">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Globe className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Time zone</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Set your time zone for accurate scheduling and timestamps.
              </div>
            </div>
          </div>
          <Select defaultValue="utc">
            <SelectTrigger className="">
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent style={{ maxHeight: "500px", overflowY: "auto" }}>
              <SelectItem value="hst">(GMT-10:00) Hawaii Time</SelectItem>
              <SelectItem value="akst">(GMT-9:00) Alaska Time</SelectItem>
              <SelectItem value="pst">(GMT-8:00) Pacific Time</SelectItem>
              <SelectItem value="mst">(GMT-7:00) Mountain Time</SelectItem>
              <SelectItem value="cst">(GMT-6:00) Central Time</SelectItem>
              <SelectItem value="est">(GMT-5:00) Eastern Time</SelectItem>
              <SelectItem value="utc">(GMT+0:00) UTC</SelectItem>
              <SelectItem value="gmt">(GMT+0:00) GMT</SelectItem>
              <SelectItem value="cet">
                (GMT+1:00) Central European Time
              </SelectItem>
              <SelectItem value="eet">
                (GMT+2:00) Eastern European Time
              </SelectItem>
              <SelectItem value="msk">(GMT+3:00) Moscow Time</SelectItem>
              <SelectItem value="ist">
                (GMT+5:30) India Standard Time
              </SelectItem>
              <SelectItem value="cst-china">
                (GMT+8:00) China Standard Time
              </SelectItem>
              <SelectItem value="kst">
                (GMT+9:00) Korea Standard Time
              </SelectItem>
              <SelectItem value="aest">
                (GMT+10:00) Australian Eastern Time
              </SelectItem>
              <SelectItem value="nzst">(GMT+12:00) New Zealand Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

          <div className="flex items-center justify-between   rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <Save className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">
                  Format of date and time
                </div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Choose how dates and times are displayed throughout the
                application.
              </div>
            </div>
          </div>
          <Select value={dateFormat} onValueChange={(v) => setDateFormat(v as any)}>
            <SelectTrigger className="">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ISO">ISO (YYYY-MM-DD)</SelectItem>
              <SelectItem value="locale">Locale</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-4">Looks and Feel</h2>
          <hr></hr>
        </div>

        <div className="flex items-center justify-between   rounded-md  group gap-4">
          <div className="flex py-2 items-center flex-1 gap-4">
            <div className="flex-1 gap-4">
              <div className="flex flex-row gap-2 items-center mb-1">
                <FerrisWheel className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                <div className="text-sm font-medium">Animations</div>
              </div>
              <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                Enable or disable animations within the application for a more
                dynamic experience. Disabling animations might help improve
                performance on older devices.
              </div>
            </div>
          </div>
          <Select value={appearance} onValueChange={(v) => setAppearance(v as any)}>
            <SelectTrigger className="">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
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
          <Select defaultValue="blue">
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
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}
