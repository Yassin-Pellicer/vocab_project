
import { Keyboard, Trash } from "lucide-react";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import AddKeybindModal from "../add-keybind-modal";
import { useState } from "react";

export default function KeybindsSection() {
  const { config, addKeybind, removeKeybind } = usePreferencesStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const keybinds = config.keybinds || [];

  return (
    <div className="mb-8 mt-2">
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
            onClick={() => {
              setIndex(index);
              setAddModalOpen(true);
            }}
            className="hover:bg-muted-foreground/10 cursor-pointer flex border items-center justify-between py-1 px-3 rounded-md  group gap-4"
          >
            <div className="flex py-1 items-center flex-1 gap-4">
              <div className="flex-1 gap-4">
                <div className="flex flex-row gap-2 items-center mb-1">
                  <Keyboard className="h-4 w-4 text-muted-foreground group gap-4-hover:text-foreground transition-colors" />
                  <div className="text-sm font-medium">{keybind.action}</div>
                </div>
                <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                  {keybind.keys.length > 0 ? `Press ${keybind.keys.join(' + ')}` : "No keys assigned"}
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="gap-2 flex items-center">
                {keybind.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-foreground bg-muted/30 border border-border rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  removeKeybind(index);
                }}
                title="Delete keybind"
              >
                <Trash className="h-8 w-8 text-muted-foreground transition-colors rounded-full hover:bg-red-500 hover:text-white p-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <AddKeybindModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={keybind => {
          addKeybind(keybind, index!);
          setAddModalOpen(false);
        }}
        index={index!}
      />
    </div>
  );
}