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
import useDeleteAccountModalHooks from "./hook";
import { useState } from "react";

export default function DeleteAccountModal({
  children,
  onConfirm,
}: {
  children: React.ReactNode;
  onConfirm?: () => void;
}) {
  const hook = useDeleteAccountModalHooks();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    hook.handleMouseDown(() => {
      onConfirm?.();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) hook.reset();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be undone.
            All your dictionaries, progress, and active subscriptions will be immediately
            cancelled and removed from our servers.
          </DialogDescription>
        </DialogHeader>
        {hook.error && (
          <p className="text-xs text-destructive my-4">{hook.error}</p>
        )}
        <DialogFooter className="mt-4 flex flex-col gap-2">
          <div className="relative overflow-hidden rounded-md">
            <div
              className="absolute inset-0 bg-gradient-to-r from-destructive to-red-700 transition-all"
              style={{
                width: `${hook.holdProgress}%`,
                opacity: hook.isHolding ? 0.8 : 0,
              }}
            />
            <Button
              type="button"
              variant="destructive"
              disabled={hook.loading}
              onMouseDown={handleConfirm}
              onTouchStart={handleConfirm}
              className="w-full relative"
            >
              {hook.loading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={hook.loading || hook.isHolding}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
