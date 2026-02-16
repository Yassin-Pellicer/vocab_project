import { BookOpen, EllipsisVertical, FolderSync, Pencil, Plus, Trash2 } from "lucide-react";
import AddDictModal from "@/components/dict/add-dict-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DictionariesSection() {
  const dictionaries = [
    { name: "Spanish Vocabulary", words: 150, lastUsed: "Today" },
    { name: "French Basics", words: 89, lastUsed: "2 days ago" },
    { name: "German Verbs", words: 234, lastUsed: "1 week ago" },
  ];

  return (
    <div className="mb-8 mt-2">
      <div>
        <h2 className="text-xl font-semibold mb-2">Dictionaries</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Manage your vocabulary dictionaries. Create, open, or remove
          dictionaries used throughout the application. Move where the dictionaries are stored by changing their route.
        </p>
        <hr />
      </div>

      <div className="space-y-4 mt-4">
        <AddDictModal>
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50  text-sm text-muted-foreground">
            <Plus className="h-4 w-4" />
            Create New Dictionary
          </button>
        </AddDictModal>

        <div className="space-y-2">
          {dictionaries.map((dict, index) => (
            <div
              key={index}
              className="flex border items-center justify-between py-1 px-3 rounded-md  group gap-4"
            >
              <div className="flex py-1 items-center flex-1 gap-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 gap-4">
                  <div className="flex flex-row gap-2 items-center mb-1">
                    <div className="text-sm font-medium">{dict.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground lg:w-3/4 w-full">
                    {dict.words} words · Last used {dict.lastUsed}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-md hover:bg-accent transition-colors">
                    <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FolderSync className="h-4 w-4 mr-2" />
                    Change Route
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
