import {
  Folder,
  Notebook,
  NotebookIcon,
  Search,
  X,
} from "lucide-react";
import useTranslationHooks from "./hook";
import { NoteSidebar } from "./note-menu/index.tsx";
import NoteActionsMenu from "../ui/note-actions-menu.tsx";
import { Button } from "../ui/button.tsx";
import AddNoteModal from "./add-note-modal/index.tsx";
import NoteDisplay from "./note-display/index.tsx";

export default function Notes({
  route,
  name,
}: {
  route: string;
  name: string;
}): JSX.Element {
  const {
    searchField,
    setSearchField,
    searchRef,
    handleMenuItemClick,
    selectedNoteTitle,
    selectedNoteRoute,
  } = useTranslationHooks({ route, name });

  return (
    <div className="h-screen flex flex-col">

      {/* Top bar */}
      <div className="bg-background flex justify-between items-center h-16 border-b pr-4 pl-1 shrink-0">
        <div className="flex flex-row gap-2 items-center">
          <div className="relative w-full max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              ref={searchRef}
              type="text"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              placeholder="Search for a Note"
              className="w-full text-sm pl-14 pr-14 bg-transparent h-9 focus:outline-none"
            />

            {searchField && (
              <X
                onClick={() => setSearchField("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row overflow-hidden h-[calc(100vh-130px)]">
        <div className="w-98 shrink-0 flex flex-col border-r">
          <div className="p-2 border-b">
            <AddNoteModal route={route} name={name} item={null}>
              <Button
                variant="outline"
                className="w-full rounded-md cursor-pointer hover:bg-muted/10"
                onClick={() => {
                  setSearchField("");
                  searchRef.current?.focus();
                }}
              >
                <Notebook /> + Add Root Note
              </Button>
            </AddNoteModal>
          </div>

          <div className="flex-1 overflow-y-auto">
            <NoteSidebar
              route={route}
              name={name}
              action={handleMenuItemClick}
              element={(item) => (
                <NoteActionsMenu
                  route={route}
                  name={name}
                  item={item}
                />
              )}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky flex flex-col top-0 gap-1 z-1 bg-background p-3 border-b">
            <p className="flex flex-row items-center gap-2 text-xl font-semibold">
              <NotebookIcon size={20} className="shrink-0" /> {selectedNoteTitle || "Notes"}
            </p>
            <p className="flex items-center gap-1 text-xs text-foreground/60"><Folder size={14}></Folder>
            <b>Route:</b> {selectedNoteRoute}</p>
          </div>
            <NoteDisplay route={route} name={name}/>
        </div>
      </div>
    </div>
  );
}