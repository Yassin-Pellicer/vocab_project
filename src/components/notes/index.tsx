import {
  Search,
  X,
} from "lucide-react";
import useTranslationHooks from "./hook";
import { NoteSidebar } from "./note-menu.tsx";

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
  } = useTranslationHooks({ route, name });

  return (
    <div>
      <div className="bg-background flex justify-between items-center h-16 border-b pr-4 pl-1">
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
                onClick={() => {
                  setSearchField("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row overflow-hidden h-[calc(100vh-130px)]">
        <NoteSidebar route={route} name={name} className="w-64" />
        <div className=" flex flex-col border-r items-center divide-y overflow-y-auto h-full shrink-0">
        </div>
      </div>
    </div>
  );
}
