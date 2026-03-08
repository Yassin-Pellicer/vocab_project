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
import { ArrowUp, FolderOpen } from "lucide-react";
import EditNoteHooks from "./hook";
import { NoteSidebar } from "../note-menu";
import { SidebarNode } from "@/types/sidebar-types";

export default function EditNoteModal({
  children,
  route,
  name,
  item,
}: {
  children?: React.ReactNode;
  route: string;
  name: string;
  item: SidebarNode | null;
}) {
  const hook = EditNoteHooks(route, name, item);

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
      <DialogContent>
        <form onSubmit={(e) => { e.preventDefault(); hook.handleAddNote(e); }}>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Move your note to a new route and change its name. Your note will not be moved by default unless you select a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className=" grid gap-3">
              <Label htmlFor="route">Select new Route</Label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"                          
                  onClick={() => hook.selectRoute(null)}
                  disabled={!item}                     
                >
                  <ArrowUp /> Bring to Root Level
                </Button>
                <div className="max-h-78 w-full ">
                  <NoteSidebar route={route} name={name} action={hook.selectRoute} />
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="name">Selected Route</Label>
              <Input
                id="route"
                type="text"
                placeholder="Select a folder..."
                value={hook.route}
                readOnly
              />
            </div>
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