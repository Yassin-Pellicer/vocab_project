import { useState } from "react";

export default function useRenameDictModalHooks() {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (dictId: string, onSuccess?: () => void) => {
    if (!newName || !dictId) return;

    setLoading(true);
    setError(null);

    try {
      await window.api.renameDictionary(dictId, newName);
      setNewName("");
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to rename dictionary.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setNewName("");
    setError(null);
    setLoading(false);
  };

  return {
    newName,
    setNewName,
    loading,
    error,
    handleSubmit,
    reset,
  };
}
