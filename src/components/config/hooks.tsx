import { supabase } from "@/supabase/supabase-client";
import { useCallback, useEffect, useRef, useState } from "react";

const AVATAR_STORAGE_KEY = "user_avatar_local";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export const useProfileSection = () => {
  const [draftDisplayName, setDraftDisplayName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileDataUrl, setAvatarFileDataUrl] = useState<string | null>(null);
  const [persistedAvatarDataUrl, setPersistedAvatarDataUrl] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
    }

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;

        if (!user) {
          setDraftDisplayName("");
          setOriginalDisplayName("");
          setDraftEmail("");
          setOriginalEmail("");
          setPersistedAvatarDataUrl(null);
          return;
        }

        const name = (user.user_metadata?.display_name as string) ?? "";
        const email = user.email ?? "";
        setDraftDisplayName(name);
        setOriginalDisplayName(name);
        setDraftEmail(email);
        setOriginalEmail(email);
        try {
          const stored = localStorage.getItem(`${AVATAR_STORAGE_KEY}_${user.id}`);
          if (stored) setPersistedAvatarDataUrl(stored);
        } catch { }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const onAvatarFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Avatar must be smaller than 2 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarRemoved(false);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarFileDataUrl((e.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  }, []);

  const removeAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarFileDataUrl(null);
    setAvatarRemoved(true);
  }, []);

  const dirty =
    draftDisplayName !== originalDisplayName ||
    draftEmail !== originalEmail ||
    avatarFile !== null ||
    avatarRemoved;

  const avatarDataUrl = avatarFileDataUrl ?? (avatarRemoved ? null : persistedAvatarDataUrl);

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");

      if (avatarRemoved) {
        try {
          localStorage.removeItem(`${AVATAR_STORAGE_KEY}_${user.id}`);
          setPersistedAvatarDataUrl(null);
          setAvatarRemoved(false);
        } catch { }
      }

      if (avatarFile && avatarFileDataUrl) {
        localStorage.setItem(`${AVATAR_STORAGE_KEY}_${user.id}`, avatarFileDataUrl);
        setPersistedAvatarDataUrl(avatarFileDataUrl);
        setAvatarFile(null);
        setAvatarFileDataUrl(null);
      }

      if (draftDisplayName !== originalDisplayName) {
        const { error: metaError } = await supabase.auth.updateUser({
          data: { display_name: draftDisplayName },
        });
        if (metaError) throw metaError;
        setOriginalDisplayName(draftDisplayName);
      }

      if (draftEmail !== originalEmail) {
        const { error: emailError } = await supabase.auth.updateUser({ email: draftEmail });
        if (emailError) throw emailError;
        setOriginalEmail(draftEmail);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(
        message.toLowerCase().includes("quota")
          ? "Not enough storage space to save the avatar. Try a smaller image."
          : message
      );
    } finally {
      setSaving(false);
    }
  }, [
    avatarRemoved,
    avatarFile,
    avatarFileDataUrl,
    draftDisplayName,
    draftEmail,
    originalDisplayName,
    originalEmail,
  ]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    signOut,
    draftDisplayName,
    draftEmail,
    setDraftDisplayName,
    setDraftEmail,
    avatarDataUrl,
    avatarFile,
    avatarRemoved,
    onAvatarFile,
    removeAvatar,
    fileInputRef,
    dirty,
    saving,
    loading,
    error,
    handleConfirm,
    user
  };
};
