import { useState } from "react";

export default function useDeleteAccountModalHooks() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const handleMouseDown = async (onConfirm?: () => void) => {
    setIsHolding(true);
    setHoldProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);

      if (progress >= 120) {
        clearInterval(interval);
        setIsHolding(false);
        setLoading(true);
        setError(null);

        try {
          window.api.deleteAccount?.();
          onConfirm?.();
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "Failed to delete account.",
          );
        } finally {
          setLoading(false);
        }
      }
    }, 60);

    const cleanup = () => {
      clearInterval(interval);
      setIsHolding(false);
      setHoldProgress(0);
    };

    // Cleanup on mouse/touch up
    const handleUp = () => {
      cleanup();
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchend", handleUp);
    };

    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchend", handleUp);
  };

  const reset = () => {
    setError(null);
    setLoading(false);
    setIsHolding(false);
    setHoldProgress(0);
  };

  return {
    loading,
    error,
    isHolding,
    holdProgress,
    handleMouseDown,
    reset,
  };
}
