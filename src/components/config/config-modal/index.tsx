import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import DonateSection from "@/components/config/sections/donate";

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
      case "donate":
        return <DonateSection />;
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
          <div className="rounded-xl px-2 border border-gray-300 flex h-8 items-center justify-center cursor-pointer hover:bg-gray-100">
            <Settings size={18} color="black" />
          </div>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-5xl gap-0 w-full p-0">
        <div className="flex rounded-xl pl-2 h-[60vh] w-full overflow-hidden">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto pt-4 px-2">{renderSection()}</div>
          </div>
        </div>
        <div className="border-t py-3 pr-8">
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
