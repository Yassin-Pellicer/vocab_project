import { useState } from "react";
import { Editor } from "@tiptap/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { NoteSidebar } from "@/components/notes/note-menu";
import { SidebarNode } from "@/types/sidebar-types";
import { NotesContext } from "@/context/notes-context";

export default function ReferenceNoteModal({
  editor,
  route,
  name,
  open,
  setOpen,
}: {
  editor: Editor | null;
  route: string;
  name: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [selectedNode, setSelectedNode] = useState<SidebarNode | null>(null);
  const { getRoute } = NotesContext();

  const insertReferenceNote = () => {
    if (!editor || !selectedNode) return;

    editor.commands.insertContent({
      type: "referenceNote",
      attrs: {
        selectedNoteId: selectedNode ? selectedNode.id : null,
        title: selectedNode ? selectedNode.title : null,
        route: selectedNode ? getRoute(selectedNode.id) : "",
      },
    });

    setOpen(false);
  };

  const selectRoute = (n: SidebarNode) => {
    setSelectedNode(n);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Reference Note</DialogTitle>
          <DialogDescription className="text-foreground/70 text-sm">
            Select a note from your dictionary to display its title and route in a Reference Note Frame.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-78 w-full ">
          <NoteSidebar route={route} name={name} action={selectRoute} />
        </div>
        <Input
          placeholder="Note to search"
          value={selectedNode ? selectedNode.title : ""}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={insertReferenceNote}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
