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
import { Book } from "lucide-react";

export default function AddDictModal() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <div className="bg-black rounded-lg px-2 flex h-8 items-center justify-center cursor-pointer">
            <Book color="white" size={18} />
            <p className="text-lg text-white leading-none pb-1">+</p>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Dictionary</DialogTitle>
            <DialogDescription>
              Add a new dictionary on the specified route and with the desired
              language/topic
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Route</Label>
              <Input
                type="file"
                placeholder="Choose a folder"
                className="mt-2"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Name</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="outline" className="!bg-blue-600 !text-white">Create</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
