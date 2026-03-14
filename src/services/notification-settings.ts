export type NotificationSettings = {
  enabled: boolean;
  durationMs?: number;
};

let settings: NotificationSettings = {
  enabled: true,
  durationMs: 5000,
};

export const setNotificationSettings = (next: Partial<NotificationSettings>) => {
  settings = { ...settings, ...next };
};

export const getNotificationSettings = (): NotificationSettings => settings;

