import {
  Folder,
  Notebook,
  NotebookIcon,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import useNotesHooks from "./hook";
import { NoteSidebar } from "./note-menu/index.tsx";
import NoteActionsMenu from "../ui/note-actions-menu.tsx";
import { Button } from "../ui/button.tsx";
import AddNoteModal from "./add-note-modal/index.tsx";
import NoteDisplay from "./note-display/index.tsx";
import { Chat } from "../chat/index.tsx";
import { useNotesStore } from "@/context/notes-context.ts";

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
    containerRef,
    handleMenuItemClick,
    selectedNoteTitle,
    selectedNoteRoute,
    sidebarWidth,
    sidebarCollapsed,
    handleResizeStart,
    chatWidth,
    chatCollapsed,
    handleResizeChat,
    expandChat,
  } = useNotesHooks();

  const { selectedNoteContent } = useNotesStore();

  return (
    <div className="h-full flex flex-col">
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

      <div
        ref={containerRef}
        className="flex flex-row overflow-hidden h-[calc(100vh-130px)] min-h-0"
      >
        {sidebarCollapsed ? (
          <div className="shrink-0 relative" style={{ width: 8 }}>
            <div
              role="separator"
              aria-orientation="vertical"
              title="Drag to resize"
              onPointerDown={handleResizeStart}
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-muted/20 hover:bg-muted/40"
            />
          </div>
        ) : (
          <div
            className="shrink-0 flex flex-col border-r relative"
            style={{ width: sidebarWidth }}
          >
            <div className="p-2 border-b">
              <AddNoteModal route={route} name={name} item={null}>
                <Button
                  variant="default"
                  className="w-full rounded-md cursor-pointer"
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
                query={searchField}
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

            <div
              role="separator"
              aria-orientation="vertical"
              title="Drag to resize"
              onPointerDown={handleResizeStart}
              className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-muted/20"
            />
          </div>
        )}
        <div className="flex flex-1 min-w-0 overflow-hidden min-h-0">
          <div className="flex-1 min-w-0 overflow-y-auto border-r min-h-0">
            {selectedNoteRoute && (
              <div className="flex flex-col gap-1 bg-background p-3 border-b">
                <p className="flex flex-row items-center gap-2 text-xl font-semibold">
                  <NotebookIcon size={20} className="shrink-0" />
                  {selectedNoteTitle || "Notes"}
                </p>
                <p className="flex items-center gap-1 text-xs text-foreground/60">
                  <Folder size={14} />
                  <b>Route:</b> {selectedNoteRoute}
                </p>
              </div>
            )}
            <NoteDisplay route={route} name={name} />
          </div>

          {chatCollapsed ? (
            <div className="flex items-center relative">
              <div
                onPointerDown={handleResizeChat}
                onClick={expandChat}
                className="absolute -right-7.5 h-15 w-15 rounded-full bg-background border"
              >
                <div className="absolute top-5 right-8.25">
                  <Sparkles size={18}></Sparkles>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="shrink-0 flex flex-col relative"
              style={{ width: chatWidth }}
            >
              <div
                role="separator"
                aria-orientation="vertical"
                title="Drag to resize"
                onPointerDown={handleResizeChat}
                className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-muted/20"
              />

              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <Chat
                  route={route}
                  name={name}
                  context={{ type: "note", content: selectedNoteContent }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
