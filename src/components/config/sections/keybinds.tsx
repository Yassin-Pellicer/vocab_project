import { Keyboard, Trash } from "lucide-react";

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
    <div className="mb-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Keybinds</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Set up your custom keybinds for quick access to various actions in the application. Pressing the specified keys will trigger the corresponding action, allowing you to navigate and use the app more efficiently.
        </p>
        <hr />
      </div>

      <div className="space-y-4 mt-4">
        {keybinds.map((keybind, index) => (
          <div
            key={index}
            className="flex border items-center justify-between py-1 px-3 rounded-md hover:bg-accent/50 transition-colors group gap-4"
          >
            <div className="flex py-1 items-center flex-1 gap-4">
              <div className="flex-1 gap-4">
                <div className="flex flex-row gap-2 items-center mb-1">
                  <Keyboard className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                  <div className="text-sm font-medium">{keybind.action}</div>
                </div>
                <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                  {`Press ${keybind.keys.join(' + ')}`}
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="gap-2 flex items-center">
                {keybind.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
              <Trash className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
