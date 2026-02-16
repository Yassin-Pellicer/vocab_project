import { useState } from "react";

export default function useChangeRouteModalHooks() {
  const [newRoute, setNewRoute] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFolderSelect = async () => {
    try {
      const dirHandle = await window.api.selectFolder();
      if (dirHandle) {
        setNewRoute(dirHandle);
        setError(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (dictId: string, onSuccess?: () => void) => {
    if (!newRoute || !dictId) return;

    setLoading(true);
    setError(null);

    try {
      await window.api.moveDictionary(dictId, newRoute);
      setNewRoute("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to move dictionary.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setNewRoute("");
    setError(null);
    setLoading(false);
  };

  return {
    newRoute,
    setNewRoute,
    loading,
    error,
    handleFolderSelect,
    handleSubmit,
    reset,
  };
}
