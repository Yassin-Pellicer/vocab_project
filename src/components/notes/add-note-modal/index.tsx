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
import AddNoteHooks from "./hook";
import { NoteSidebar } from "../note-menu";
import { SidebarNode } from "@/types/sidebar-types";

export default function AddNoteModal({
  children,
  route,
  name,
  item,
}: {
  children?: React.ReactNode;
  route: string;
  name: string;
  item?: SidebarNode | null;
}) {
  const hook = AddNoteHooks(route, name, item);

  return (
    <Dialog>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <div className="rounded-lg gap-1 border text-sm border-border flex h-8 items-center justify-center cursor-pointer hover:bg-popover text-popover-foreground">
            + Add Note
            <FolderOpen size={14} />
          </div>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={(e) => { e.preventDefault(); hook.handleAddNote(e); }}>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Create a new note on the specified route.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className="grid gap-3">
              {hook.disableSetRouteInput ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    type="text"
                    placeholder="Select a folder..."
                    value={hook.route}
                    readOnly
                  />
                </div>

              ) : (
                <div className="max-h-98 mb-4">
                  <Label htmlFor="route">Route</Label>
                  <NoteSidebar route={route} name={name} action={hook.selectRoute} />
                </div>
              )}
            </div>
            {!hook.disableSetRouteInput &&
              <div className="grid gap-3">
                <Label htmlFor="name">Selected Route</Label>
                <Input
                  id="route"
                  type="text"
                  placeholder="Select a folder..."
                  value={hook.route}
                  readOnly
                />
              </div>}
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="New Note"
                defaultValue="New Note"
                value={hook.name}
                onChange={(e) => { hook.setName(e.target.value); e.preventDefault() }}
                required
              />
            </div>
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
                className="bg-primary text-primary-foreground"
                disabled={!hook.name.trim()}
              >
                Create
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}