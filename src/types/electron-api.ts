import type { TranslationEntry } from "./translation-entry";
import type { UserConfig, UserPreferences } from "./config";
import type { ChatMessage } from "./chat";

type GraphWordRef = { uuid: string; word?: string };

export type IpcRendererListener = (
  event: unknown,
  ...args: unknown[]
) => void;

export interface IpcRendererLike {
  on: (channel: string, listener: IpcRendererListener) => unknown;
  off: (channel: string, listener: IpcRendererListener) => unknown;
  send: (channel: string, ...args: unknown[]) => void;
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>;
}

export interface RendererApi {
  requestTranslations: (
    route: string,
    name: string,
  ) => Promise<TranslationEntry[] | undefined>;

  addTranslation: (
    entry: TranslationEntry,
    word: string | null,
    route: string,
    name: string,
  ) => Promise<unknown>;

  deleteTranslation: (
    word: string,
    route: string,
    name: string,
  ) => Promise<unknown>;

  createDictionary: (route: string, name: string) => Promise<unknown>;
  moveDictionary: (
    dictId: string,
    newRoute: string,
  ) => Promise<{ success: boolean; oldRoute: string; newRoute: string }>;
  deleteDictionary: (dictId: string) => Promise<unknown>;
  renameDictionary: (dictId: string, newName: string) => Promise<unknown>;
  selectFolder: () => Promise<string | null>;

  loadConfig: () => Promise<UserConfig>;
  editConfig: (newConfig: UserConfig) => Promise<UserConfig>;

  loadUserPreferences: () => Promise<UserPreferences>;
  saveUserPreferences: (config: UserPreferences) => Promise<UserPreferences>;

  fetchMarkdown: (
    route: string,
    name: string,
    uuid: string,
    noteId?: string | null,
  ) => Promise<unknown>;
  saveMarkdown: (
    route: string,
    name: string,
    uuid: string,
    markdown: unknown,
  ) => Promise<unknown>;

  fetchConjugation: (
    route: string,
    name: string,
    uuid?: string,
  ) => Promise<unknown>;
  saveConjugation: (
    route: string,
    name: string,
    uuid: string,
    conjugation: unknown,
  ) => Promise<unknown>;

  fetchGraph: (route: string, name: string, uuid?: string) => Promise<unknown>;
  saveGraph: (
    route: string,
    name: string,
    origin: GraphWordRef,
    destination: GraphWordRef,
  ) => Promise<unknown>;
  deleteGraphEntry: (
    route: string,
    name: string,
    origin: GraphWordRef,
    destination: GraphWordRef,
  ) => Promise<unknown>;

  fetchNotes: (route: string, name: string, uuid: string) => Promise<unknown>;
  fetchNoteIndex: (route: string, name: string) => Promise<unknown>;
  saveNoteIndex: (
    route: string,
    name: string,
    currentConfig: unknown,
  ) => Promise<unknown>;
  saveNotes: (
    route: string,
    name: string,
    uuid: string,
    content: unknown,
  ) => Promise<unknown>;

  minimize: () => Promise<unknown>;
  maximize: () => Promise<unknown>;
  close: () => Promise<unknown>;
  openNewWindow: (route: string) => Promise<unknown>;

  chatSend: (messages: ChatMessage[], accessToken: string) => Promise<{
    text?: string;
    tool_calls?: unknown[];
    [key: string]: unknown;
  }>;

  chatConfig: (language: string, accessToken: string) => any;
  deleteAccount: (
    accessToken: string,
  ) => Promise<{ success: boolean; [key: string]: unknown }>;
}
