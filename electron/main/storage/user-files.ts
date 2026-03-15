import { UserConfig, UserPreferences } from "@/types/config";
import {
  getUserDataFilePath,
  USER_CONFIG_FILENAME,
  USER_PREFERENCES_FILENAME,
} from "./paths";
import { readJsonFile, writeJsonFile } from "./json";

const defaultUserConfig: UserConfig = {};
const defaultUserPreferences: UserPreferences = {};

export const getUserConfigPath = () => getUserDataFilePath(USER_CONFIG_FILENAME);
export const getUserPreferencesPath = () =>
  getUserDataFilePath(USER_PREFERENCES_FILENAME);

export async function readUserConfig(): Promise<UserConfig> {
  const filePath = getUserConfigPath();
  return readJsonFile<UserConfig>(filePath, defaultUserConfig);
}

export async function writeUserConfig(config: UserConfig) {
  return writeJsonFile(getUserConfigPath(), config);
}

export async function readUserPreferences(): Promise<UserPreferences> {
  const filePath = getUserPreferencesPath();
  return readJsonFile<UserPreferences>(filePath, defaultUserPreferences);
}

export async function writeUserPreferences(prefs: UserPreferences) {
  return writeJsonFile(getUserPreferencesPath(), prefs);
}
