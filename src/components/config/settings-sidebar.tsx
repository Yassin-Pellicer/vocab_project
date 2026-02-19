import { 
  Settings, 
  Keyboard, 
  BookOpen, 
  User, 
  CreditCard, 
  Sparkles, 
  Info 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "general", label: "General", icon: Settings },
  { id: "keybinds", label: "Keybinds", icon: Keyboard },
  { id: "dictionaries", label: "Dictionaries", icon: BookOpen },
  { id: "profile", label: "Your Profile", icon: User },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "ai", label: "Artificial Intelligence", icon: Sparkles },
  { id: "about", label: "About", icon: Info },
];  

export default function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <div className="border-r bg-background/50 h-full pt-2 pr-2 w-48">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 my-1 px-3 py-[4px] rounded-md text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeSection === item.id 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
    </div>  );
}
