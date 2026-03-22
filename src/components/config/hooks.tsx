import { supabase } from "@/supabase/supabase-client";
import { useCallback } from "react";

export default function useConfig() {

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return {
    signOut,
  };
}
