import { useCallback } from "react";
import { supabase } from "@/supabase/supabase-client";

export default function useConfig() {
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    signOut,
  };
}
