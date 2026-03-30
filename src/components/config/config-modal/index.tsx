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
import SubscriptionSection from "@/components/config/sections/subscription";
import AISection from "@/components/config/sections/ai";
import AboutSection from "@/components/config/sections/about";
import { Button } from "@/components/ui/button";

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
        <DialogTrigger asChild data-config-trigger="settings">
          {children}
        </DialogTrigger>
      ) : (
        <DialogTrigger
          asChild
          data-config-trigger="settings"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <Button className="flex items-center justify-center rounded-full! h-8! w-8!" variant={"outline"}>
            <Settings /> 
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="lg:max-w-5xl md:max-w-3xl sm:max-w-2xl w-full p-0!">
        <div className="flex rounded-xl h-[70vh] max-h-200 overflow-hidden">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto pt-4 px-6!">{renderSection()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
