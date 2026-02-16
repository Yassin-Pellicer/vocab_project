import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen } from "lucide-react";
import useChangeRouteModalHooks from "./hook";
import { useConfigStore } from "@/context/dictionary-context";

interface ChangeRouteModalProps {
  dictId: string;
  dictName: string;
  currentRoute: string;
  children: React.ReactNode;
}

export default function ChangeRouteModal({
  dictId,
  dictName,
  currentRoute,
  children,
}: ChangeRouteModalProps) {
  const hook = useChangeRouteModalHooks();
  const loadConfig = useConfigStore((state) => state.loadConfig);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await hook.handleSubmit(dictId, async () => {
      await loadConfig();
    });
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) hook.reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Change Dictionary Route</DialogTitle>
            <DialogDescription>
              Move <span className="font-medium">{dictName}</span> to a new
              location. The entire dictionary folder will be moved recursively
              to the selected destination.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className="grid gap-3">
              <Label>Current Route</Label>
              <Input
                type="text"
                value={currentRoute}
                readOnly
                disabled
                className="flex-1 text-muted-foreground"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="newRoute">New Route</Label>
              <div className="flex gap-2">
                <Input
                  id="newRoute"
                  type="text"
                  placeholder="Select a destination folder..."
                  value={hook.newRoute}
                  readOnly
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={hook.handleFolderSelect}
                  className="px-3"
                >
                  <FolderOpen size={18} />
                </Button>
              </div>
            </div>
            {hook.error && (
              <p className="text-xs text-destructive">{hook.error}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="submit"
                variant="outline"
                className="!bg-blue-600 !text-white"
                disabled={!hook.newRoute || hook.loading}
              >
                {hook.loading ? "Moving..." : "Move"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
