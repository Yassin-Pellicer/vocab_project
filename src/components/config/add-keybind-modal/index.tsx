import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAddKeybindModal } from "./hooks";
import { Keybind, PRESET_KEYBINDS } from "@/types/config";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface AddKeybindModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (keybind: Keybind) => void;
  index: number;
}

export default function AddKeybindModal({
  open,
  onClose,
  onAdd,
  index,
}: AddKeybindModalProps) {
  const { customKeys, reset, dialogContentRef, handleAdd } = useAddKeybindModal(
    {
      open,
      onAdd,
      index,
      onClose,
    },
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent
        ref={dialogContentRef}
        className="min-w-[320px] flex flex-col"
      >
        <div className="w-full flex">
          <span className="flex items-center gap-1.5 text-foreground/70 text-md font-medium text-center">
            <Keyboard className="h-5"></Keyboard><b>{PRESET_KEYBINDS[index!]?.action}</b>
          </span>
        </div>
        <div className="w-full flex flex-col items-center justify-center mt-[-10px]">
          <input
            className="sr-only"
            type="text"
            tabIndex={-1}
            aria-label="Keybind input"
            value={customKeys}
            readOnly
          />
          <div className="flex flex-col items-center justify-center w-full">
            {customKeys.trim() === "" ? (
                <kbd
                className="text-xs text-muted-foreground text-center cursor-pointer hover:bg-muted/10 rounded-lg px-2 py-2 transition-colors "
                tabIndex={0}
                onFocus={(e) => {
                  e.currentTarget.innerHTML =
                  "<b>Press the desired key combination for the action.</b><br/> Start typing...";
                }}
                onBlur={(e) => {
                  e.currentTarget.innerHTML =
                  "<b>Press the desired key combination for the action.</b><br/> Click to focus and start typing.";
                }}
                dangerouslySetInnerHTML={{
                  __html:
                  "<b>Press the desired key combination for the action.</b><br/> Click to focus and start typing.",
                }}
                />
            ) : (
              <div className="flex gap-2 items-center justify-center">
                {customKeys
                  .split("+")
                  .filter(Boolean)
                  .map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      className="px-2 py-1 text-sm text-foreground bg-muted/30 font-semibold text-muted-foreground bg-muted border border-border rounded shadow-sm"
                    >
                      {key}
                    </kbd>
                  ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-full py-2 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            onClick={handleAdd}
          >
            Confirm Keybind
          </Button>
          <DialogClose asChild>
            <button className="hidden" aria-label="Close" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
