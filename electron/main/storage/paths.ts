import { app } from "electron";
import path from "node:path";

export const USER_CONFIG_FILENAME = "user-config.json";
export const USER_PREFERENCES_FILENAME = "user-preferences.json";

const getAppRoot = () => process.env.APP_ROOT ?? app.getAppPath();

export const getLegacyPublicFilePath = (filename: string) =>
  path.join(getAppRoot(), "public", filename);

export const getUserDataDir = () => app.getPath("userData");

export const getUserDataFilePath = (filename: string) =>
  path.join(getUserDataDir(), filename);

