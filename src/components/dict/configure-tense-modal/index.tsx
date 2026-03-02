import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import useConfigureTenseModal from "./hook";
import { RefreshCw } from "lucide-react";

interface ConfigureTenseModalProps {
  dictId?: string;
  dictName?: string;
  children: React.ReactNode;
}

export default function ConfigureTenseModal({
  dictId,
  dictName,
  children,
}: ConfigureTenseModalProps) {
  const hook = useConfigureTenseModal(dictId);

  return (
    <Dialog onOpenChange={(open) => { if (!open) hook.reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full p-0">
        <div className="p-6 pb-2 overflow-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Configure tenses for <b>{dictName ? `${dictName}` : ""}</b>
            </DialogTitle>
            <DialogDescription>
              Tenses allow you to configure different verb forms for your dictionary.
            </DialogDescription>
            <DialogDescription>
              It is important noting that tenses can only be built using a <b>predefined structure.</b> An example of it will load right below. You can alter the names and fields of this structure, but changing its syntax may result in the tenses not working properly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="tense-structure">Tense Structure</Label>
              <textarea
                id="tense-structure"
                value={hook.structure}
                onChange={(e) => hook.setStructure(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const el = e.target as HTMLTextAreaElement;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const value = el.value;
                    const updated =
                      value.substring(0, start) + "\t" + value.substring(end);
                    hook.setStructure(updated);
                    requestAnimationFrame(() => {
                      el.selectionStart = el.selectionEnd = start + 1;
                    });
                  }
                }}
                className="w-full h-98 p-3 font-mono text-xs border-muted border-1 rounded-md bg-background overflow-auto"
                spellCheck={false}
                placeholder="Enter tense structure..."
              />
              <DialogDescription>
                You can check out <a href="https://github.com/your-repo/your-docs" target="_blank" className="underline">our webpage</a> for info on configuring tense structures and to download already set up configs for your language.
              </DialogDescription>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={hook.save}>
                Save Tense Configuration
              </Button>
              <Button type="reset" variant="outline" onClick={hook.reset}>
                <RefreshCw size={16} /> Reset Structure
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}