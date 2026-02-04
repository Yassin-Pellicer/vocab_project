import { useState } from "react";
import SettingsSidebar from "./settings-sidebar";
import GeneralSection from "./sections/general";
import KeybindsSection from "./sections/keybinds";
import DictionariesSection from "./sections/dictionaries";
import ProfileSection from "./sections/profile";
import SubscriptionSection from "./sections/subscription";
import AISection from "./sections/ai";
import AboutSection from "./sections/about";
import DonateSection from "./sections/donate";

interface ConfigProps {
  route: string;
  name: string;
}

export default function Config({ route, name }: ConfigProps): JSX.Element {
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
    <div className="h-screen flex">
      <SettingsSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 pb-20">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}