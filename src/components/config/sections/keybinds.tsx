import { Keyboard } from "lucide-react";

export default function KeybindsSection() {
  const keybinds = [
    { action: "New Word", keys: ["Ctrl", "N"] },
    { action: "Search", keys: ["Ctrl", "K"] },
    { action: "Save", keys: ["Ctrl", "S"] },
    { action: "Quick Add", keys: ["Ctrl", "Shift", "A"] },
    { action: "Settings", keys: ["Ctrl", ","] },
    { action: "Toggle Sidebar", keys: ["Ctrl", "B"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Keybinds</h2>
        <p className="text-sm text-muted-foreground">
          View and customize keyboard shortcuts
        </p>
      </div>

      <div className="space-y-2">
        {keybinds.map((keybind, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{keybind.action}</span>
            </div>
            <div className="flex gap-1">
              {keybind.keys.map((key, keyIndex) => (
                <kbd
                  key={keyIndex}
                  className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
