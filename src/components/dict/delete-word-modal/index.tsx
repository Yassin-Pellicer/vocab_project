import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TranslationEntry } from "@/types/translation-entry";
import { Trash } from "lucide-react";
import useDeleteWordModalHooks from "./hook";

export default function DeleteWordModal({word, route, name} : {word: TranslationEntry, route: string, name: string}) {
  const { handleSubmit } = useDeleteWordModalHooks({ word, route, name });
  return (
    <Dialog>
      <form onSubmit={handleSubmit}>
        <DialogTrigger asChild>
          <Button variant="outline" className="!bg-red-600 !text-white"><Trash></Trash></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Word</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this word from the dictionary? This process
              can't be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" variant="outline" className="!bg-red-600 !text-muted-foreground">Delete</Button>
            <DialogClose asChild>
              <Button variant="outline" >Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
