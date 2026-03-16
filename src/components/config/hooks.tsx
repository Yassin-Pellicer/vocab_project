import { useConfigStore as useDictionaryStore } from "@/context/dictionary-context";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import { supabase } from "@/supabase/supabase-client";
import { useCallback } from "react";

export default function useConfig() {
  const { dictionaryMetadata, setDictionaryMetadata } = useDictionaryStore();

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const {
    config: preferences,
    setConfig,
    setNotifications,
    setNotificationLifetime,
    setLanguage,
    setTimezone,
    setDateFormat,
    setAnimations,
    setAccentColor,
    setAppearance,
    setDisplayName,
    setEmail,
    setAvatarPath,
    setOffline,
    setKeybinds,
    updateKeybind,
    addKeybind,
    removeKeybind,
    setSubscriptionPlan,
    loadConfig,
    saveConfig,
    resetConfig,
  } = usePreferencesStore();

  return {
    dictionaryMetadata,
    preferences,
    setDictionaryMetadata,
    setConfig,
    setNotifications,
    setNotificationLifetime,
    setLanguage,
    setTimezone,
    setDateFormat,
    setAnimations,
    setAccentColor,
    setAppearance,
    setDisplayName,
    setEmail,
    setAvatarPath,
    setOffline,
    setKeybinds,
    updateKeybind,
    addKeybind,
    removeKeybind,
    setSubscriptionPlan,
    loadConfig,
    saveConfig,
    resetConfig,
    signOut,
  };
}
