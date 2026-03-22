export type NotificationPayloads = {
  wordAdded: { word: string; dictionary: string };
  wordEdited: { before: string; after: string; dictionary: string };
  configSaved: { scope: "dictionary" | "preferences" };
  noteCreated: { title: string; dictionary: string };
  noteUpdated: {
    dictionary: string;
    renamed: boolean;
    moved: boolean;
    fromPath: string | null;
    toPath: string | null;
    fromTitle: string;
    toTitle: string;
  };
  wordDeleted: { word: string; dictionary: string };
  noteDeleted: { title: string; dictionary: string };
};

export type NotificationKey = keyof NotificationPayloads;

type NotificationKind = "success" | "info" | "warning" | "error" | "message";

export type NotificationTemplate<K extends NotificationKey> = {
  kind: NotificationKind;
  title: (payload: NotificationPayloads[K]) => string;
  description?: (payload: NotificationPayloads[K]) => string | undefined;
  id?: (payload: NotificationPayloads[K]) => string;
  cooldownMs?: number;
};

export const NOTIFICATIONS: { [K in NotificationKey]: NotificationTemplate<K> } =
  {
    wordAdded: {
      kind: "success",
      title: ({ word }) => `Added “${word}”`,
      description: ({ dictionary }) => `Dictionary: ${dictionary}`,
      id: ({ dictionary, word }) => `word-added:${dictionary}:${word}`,
    },

    wordEdited: {
      kind: "success",
      title: ({ after }) => `Updated “${after}”`,
      description: ({ before, after, dictionary }) =>
        before && before !== after
          ? `Renamed from “${before}” · ${dictionary}`
          : `Dictionary: ${dictionary}`,
      id: ({ dictionary, after }) => `word-edited:${dictionary}:${after}`,
    },

    configSaved: {
      kind: "success",
      title: ({ scope }) =>
        scope === "preferences" ? "Preferences saved" : "Dictionary config saved",
      description: () => undefined,
      id: ({ scope }) => `config-saved:${scope}`,
      cooldownMs: 1500,
    },

    noteCreated: {
      kind: "success",
      title: ({ title }) => `Note created: “${title}”`,
      description: ({ dictionary }) => `Dictionary: ${dictionary}`,
      id: ({ dictionary, title }) => `note-created:${dictionary}:${title}`,
    },

    noteUpdated: {
      kind: "success",
      title: ({ renamed, moved, toTitle }) => {
        if (renamed && moved) return `Note updated: “${toTitle}”`;
        if (renamed) return `Note renamed: “${toTitle}”`;
        if (moved) return `Note moved: “${toTitle}”`;
        return `Note updated: “${toTitle}”`;
      },
      description: ({ fromPath, toPath, dictionary, fromTitle, toTitle }) => {
        const from = fromPath ?? fromTitle;
        const to = toPath ?? toTitle;
        return from && to && from !== to
          ? `“${from}” → “${to}” · ${dictionary}`
          : `Dictionary: ${dictionary}`;
      },
      id: ({ dictionary, toTitle }) => `note-updated:${dictionary}:${toTitle}`,
    },

    wordDeleted: {
      kind: "info",
      title: ({ word }) => `Deleted “${word}”`,
      description: ({ dictionary }) => `Dictionary: ${dictionary}`,
      id: ({ dictionary, word }) => `word-deleted:${dictionary}:${word}`,
    },

    noteDeleted: {
      kind: "info",
      title: ({ title }) => `Deleted note: “${title}”`,
      description: ({ dictionary }) => `Dictionary: ${dictionary}`,
      id: ({ dictionary, title }) => `note-deleted:${dictionary}:${title}`,
    },
  };
