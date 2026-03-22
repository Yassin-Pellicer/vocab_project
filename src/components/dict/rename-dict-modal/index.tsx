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
import { useState } from "react";
import { DictionaryContext } from "@/context/dictionary-context";

import useRenameDictModalHooks from "./hook";

export default function RenameDictModal({
  dictId,
  dictName,
  children,
}: {
  dictId: string;
  dictName: string;
  children: React.ReactNode;
}) {
  
  const [open, setOpen] = useState(false);
  const hook = useRenameDictModalHooks();
  const loadConfig = DictionaryContext((state) => state.loadConfig);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await hook.handleSubmit(dictId, async () => {
      await loadConfig();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) hook.reset();
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Dictionary</DialogTitle>
            <DialogDescription>
              Enter a new name for <span className="font-medium">{dictName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className="grid gap-3">
              <Label htmlFor="newName">New Name</Label>
              <Input
                id="newName"
                type="text"
                placeholder="Enter new dictionary name..."
                value={hook.newName}
                onChange={(e) => hook.setNewName(e.target.value)}
                required
                className="flex-1"
              />
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
            <Button
              type="submit"
              disabled={!hook.newName || hook.loading}
            >
              {hook.loading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
