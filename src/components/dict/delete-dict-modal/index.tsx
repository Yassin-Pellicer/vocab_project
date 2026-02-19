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
import useDeleteDictModalHooks from "./hook";
import { useConfigStore } from "@/context/dictionary-context";

interface DeleteDictModalProps {
  dictId: string;
  dictName: string;
  children: React.ReactNode;
}

export default function DeleteDictModal({
  dictId,
  dictName,
  children,
}: DeleteDictModalProps) {
  const hook = useDeleteDictModalHooks();
  const loadConfig = useConfigStore((state) => state.loadConfig);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await hook.handleSubmit(dictId, async () => {
      await loadConfig();
    });
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) hook.reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Delete Dictionary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{dictName}</span>?
              This action cannot be undone. The dictionary folder and all its contents will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          {hook.error && (
            <p className="text-xs text-destructive my-4">{hook.error}</p>
          )}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={hook.loading}
            >
              {hook.loading ? "Deleting..." : "Delete Dictionary"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
