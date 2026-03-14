import { EllipsisVertical, FolderSync, Notebook, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AddNoteModal from "../notes/add-note-modal";
import { SidebarNode } from "@/types/sidebar-types";
import EditNoteModal from "../notes/edit-note-modal";
import DeleteNoteModal from "../notes/delete-note-modal";
type Props = {
  route: string;
  name: string;
  item: SidebarNode | null;
};

export default function NoteActionsMenu({ route, name, item }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-md hover:bg-accent transition-colors">
          <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AddNoteModal route={route} name={name} item={item}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Notebook className="h-4 w-4 mr-2" />
            + Add Nested Note
          </DropdownMenuItem>
        </AddNoteModal>
        <EditNoteModal route={route} name={name} item={item}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <FolderSync className="h-4 w-4 mr-2" />
            Edit Note
          </DropdownMenuItem>
        </EditNoteModal>
        <DeleteNoteModal route={route} name={name} item={item}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DeleteNoteModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
