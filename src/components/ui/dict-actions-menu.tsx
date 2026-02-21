import { EllipsisVertical, FolderSync, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ChangeRouteModal from "@/components/dict/change-route-modal";
import RenameDictModal from "@/components/dict/rename-dict-modal";
import DeleteDictModal from "@/components/dict/delete-dict-modal";

type Props = {
  dictId: string;
  dictName: string;
  currentRoute: string;
};

export default function DictActionsMenu({ dictId, dictName, currentRoute }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-md hover:bg-accent transition-colors">
          <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ChangeRouteModal dictId={dictId} dictName={dictName} currentRoute={currentRoute}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <FolderSync className="h-4 w-4 mr-2" />
            Change Route
          </DropdownMenuItem>
        </ChangeRouteModal>
        <RenameDictModal dictId={dictId} dictName={dictName}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
        </RenameDictModal>
        <DeleteDictModal dictId={dictId} dictName={dictName}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DeleteDictModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
