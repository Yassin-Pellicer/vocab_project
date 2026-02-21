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
import useDictModalHooks from "./hook";

export default function AddDictModal({
  children,
}: {
  children?: React.ReactNode;
}) {
  const hook = useDictModalHooks();

  return (
    <Dialog>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <div className="rounded-lg gap-1 border !text-xs border-gray-300 flex h-8 items-center justify-center cursor-pointer hover:bg-gray-100">
            + Add Dictionary
            <FolderOpen color="black" size={14} />
          </div>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={hook.handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Dictionary</DialogTitle>
            <DialogDescription>
              Add a new dictionary on the specified route and with the desired
              language/topic
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className="grid gap-3">
              <Label htmlFor="route">Route</Label>
              <div className="flex gap-2">
                <Input
                  id="route"
                  type="text"
                  placeholder="Select a folder..."
                  value={hook.route}
                  readOnly
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={hook.handleFolderSelect}
                  className="px-3"
                >
                  <FolderOpen size={18} />
                </Button>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Spanish Dictionary"
                value={hook.name}
                onChange={(e) => hook.setName(e.target.value)}
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
                className="!bg-blue-600 !text-white"
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