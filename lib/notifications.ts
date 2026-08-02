export type NotificationRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

export type EnterpriseNotification = {
  id: string;
  title: string;
  message: string;
  href?: string;
  recipientRoles: NotificationRole[];
  recipientEmails?: string[];
  readBy: string[];
  createdAt: string;
};

const STORAGE_KEY = "notifications";
const UPDATE_EVENT = "enterprise-notifications-updated";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function getNotificationUserKey(user: {
  email?: string;
  name?: string;
  role: NotificationRole;
}) {
  return normalize(
    user.email || `${user.name || "user"}-${user.role}`,
  );
}

export function getNotifications(): EnterpriseNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedNotifications =
      window.localStorage.getItem(STORAGE_KEY);

    if (!savedNotifications) {
      return [];
    }

    const parsedNotifications =
      JSON.parse(savedNotifications);

    return Array.isArray(parsedNotifications)
      ? (parsedNotifications as EnterpriseNotification[])
      : [];
  } catch {
    return [];
  }
}

function saveNotifications(
  notifications: EnterpriseNotification[],
) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notifications),
  );

  window.dispatchEvent(
    new Event(UPDATE_EVENT),
  );
}

export function createNotification({
  title,
  message,
  href,
  recipientRoles,
  recipientEmails,
}: {
  title: string;
  message: string;
  href?: string;
  recipientRoles: NotificationRole[];
  recipientEmails?: string[];
}) {
  if (typeof window === "undefined") {
    return;
  }

  const notification: EnterpriseNotification = {
    id: `NOT-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    title: title.trim(),
    message: message.trim(),
    href,
    recipientRoles,
    recipientEmails: recipientEmails?.map(normalize),
    readBy: [],
    createdAt: new Date().toISOString(),
  };

  saveNotifications([
    notification,
    ...getNotifications(),
  ]);
}

export function isNotificationVisibleToUser(
  notification: EnterpriseNotification,
  user: {
    email?: string;
    role: NotificationRole;
  },
) {
  const roleMatches =
    notification.recipientRoles.includes(user.role);

  const normalizedEmail =
    normalize(user.email || "");

  const emailMatches =
    normalizedEmail !== "" &&
    Boolean(
      notification.recipientEmails?.some(
        (email) => normalize(email) === normalizedEmail,
      ),
    );

  return roleMatches || emailMatches;
}

export function markNotificationAsRead(
  notificationId: string,
  userKey: string,
) {
  const normalizedUserKey = normalize(userKey);

  const updatedNotifications =
    getNotifications().map((notification) => {
      if (notification.id !== notificationId) {
        return notification;
      }

      if (
        notification.readBy
          .map(normalize)
          .includes(normalizedUserKey)
      ) {
        return notification;
      }

      return {
        ...notification,
        readBy: [
          ...notification.readBy,
          normalizedUserKey,
        ],
      };
    });

  saveNotifications(updatedNotifications);
}

export function markAllNotificationsAsRead(
  notificationIds: string[],
  userKey: string,
) {
  const idSet = new Set(notificationIds);
  const normalizedUserKey = normalize(userKey);

  const updatedNotifications =
    getNotifications().map((notification) => {
      if (!idSet.has(notification.id)) {
        return notification;
      }

      if (
        notification.readBy
          .map(normalize)
          .includes(normalizedUserKey)
      ) {
        return notification;
      }

      return {
        ...notification,
        readBy: [
          ...notification.readBy,
          normalizedUserKey,
        ],
      };
    });

  saveNotifications(updatedNotifications);
}

export function subscribeToNotifications(
  callback: () => void,
) {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      UPDATE_EVENT,
      callback,
    );

    window.removeEventListener(
      "storage",
      handleStorage,
    );
  };
}
