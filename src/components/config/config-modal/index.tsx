import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useState } from "react";
import SettingsSidebar from "@/components/config/settings-sidebar";
import GeneralSection from "@/components/config/sections/general";
import KeybindsSection from "@/components/config/sections/keybinds";
import DictionariesSection from "@/components/config/sections/dictionaries";
import ProfileSection from "@/components/config/sections/profile";
import SubscriptionSection from "@/components/config/sections/subscription";
import AISection from "@/components/config/sections/ai";
import AboutSection from "@/components/config/sections/about";

export default function ConfigModal({ children }: { children?: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState("general");

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSection />;
      case "keybinds":
        return <KeybindsSection />;
      case "dictionaries":
        return <DictionariesSection />;
      case "profile":
        return <ProfileSection />;
      case "subscription":
        return <SubscriptionSection />;
      case "ai":
        return <AISection />;
      case "about":
        return <AboutSection />;
      default:
        return <GeneralSection />;
    }
  };

  return (
    <Dialog>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <div className="rounded-xl px-2 border border-border flex h-8 items-center justify-center cursor-pointer hover:bg-popover text-popover-foreground">
            <Settings size={18} />
          </div>
        </DialogTrigger>
      )}
      <DialogContent className="lg:max-w-5xl md:max-w-3xl sm:max-w-2xl w-full p-0">
        <div className="flex rounded-xl pl-2 h-[70vh] max-h-[800px] overflow-hidden">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto pt-4 px-6">{renderSection()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
