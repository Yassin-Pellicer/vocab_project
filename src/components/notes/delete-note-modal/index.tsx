import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderOpen } from "lucide-react";
import deleteNoteModalHooks from "./hook";
import { SidebarNode } from "@/types/sidebar-types";

export default function DeleteNoteModal({ children, route, name, item }: { children?: React.ReactNode, route: string, name: string, item: SidebarNode | null }) {
  const hook = deleteNoteModalHooks(route, name, item);
  return (
    <Dialog>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <div className="rounded-lg gap-1 border text-sm border-border flex h-8 items-center justify-center cursor-pointer hover:bg-popover text-popover-foreground">
            Delete Note
            <FolderOpen size={14} />

          </div>
        </DialogTrigger>
      )}
      <form>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Note? All its children Notes will also be deleted.
              This process can't be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={hook.removeNote} className="text-white!" variant="destructive">
              Delete
            </Button>
            <DialogClose asChild>
              <Button variant="outline" >Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}