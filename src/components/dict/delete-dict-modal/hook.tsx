import { useState } from "react";

export default function useDeleteDictModalHooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (dictId: string, onSuccess?: () => void) => {
    if (!dictId) return;

    setLoading(true);
    setError(null);

    try {
      await window.api.deleteDictionary(dictId);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to delete dictionary.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    handleSubmit,
    reset,
  };
}
