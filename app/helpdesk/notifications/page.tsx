/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import {
  EnterpriseNotification,
  NotificationRole,
  getNotificationUserKey,
  getNotifications,
  isNotificationVisibleToUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from "@/lib/notifications";

type CurrentUser = {
  name: string;
  email?: string;
  role: NotificationRole;
};

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getNotificationType(
  notification: EnterpriseNotification,
) {
  const content =
    `${notification.title} ${notification.message}`.toLowerCase();

  if (
    content.includes("critical") ||
    content.includes("breached") ||
    content.includes("failed") ||
    content.includes("error")
  ) {
    return "Critical";
  }

  if (
    content.includes("warning") ||
    content.includes("at risk") ||
    content.includes("waiting")
  ) {
    return "Warning";
  }

  if (
    content.includes("resolved") ||
    content.includes("completed") ||
    content.includes("success")
  ) {
    return "Success";
  }

  return "Information";
}

export default function NotificationsPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [notifications, setNotifications] =
    useState<EnterpriseNotification[]>([]);

  const [filter, setFilter] = useState<
    "All" | "Unread" | "Read"
  >("All");

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedCurrentUser =
        JSON.parse(savedCurrentUser) as CurrentUser;

      setCurrentUser(parsedCurrentUser);

      function loadNotifications() {
        setNotifications(getNotifications());
      }

      loadNotifications();

      return subscribeToNotifications(
        loadNotifications,
      );
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );
      router.replace("/login");
    }
  }, [router]);

  const userKey = useMemo(() => {
    if (!currentUser) {
      return "";
    }

    return getNotificationUserKey({
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    });
  }, [currentUser]);

  const visibleNotifications = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return notifications
      .filter((notification) =>
        isNotificationVisibleToUser(
          notification,
          {
            email: currentUser.email,
            role: currentUser.role,
          },
        ),
      )
      .sort(
        (firstNotification, secondNotification) =>
          new Date(
            secondNotification.createdAt,
          ).getTime() -
          new Date(
            firstNotification.createdAt,
          ).getTime(),
      );
  }, [currentUser, notifications]);

  const filteredNotifications = useMemo(() => {
    return visibleNotifications.filter(
      (notification) => {
        const isRead = notification.readBy
          .map((reader) =>
            reader.toLowerCase().trim(),
          )
          .includes(
            userKey.toLowerCase().trim(),
          );

        if (filter === "Unread") {
          return !isRead;
        }

        if (filter === "Read") {
          return isRead;
        }

        return true;
      },
    );
  }, [
    filter,
    userKey,
    visibleNotifications,
  ]);

  const unreadCount = visibleNotifications.filter(
    (notification) =>
      !notification.readBy
        .map((reader) =>
          reader.toLowerCase().trim(),
        )
        .includes(
          userKey.toLowerCase().trim(),
        ),
  ).length;

  const readCount =
    visibleNotifications.length - unreadCount;

  function handleMarkAsRead(
    notificationId: string,
  ) {
    if (!userKey) {
      return;
    }

    markNotificationAsRead(
      notificationId,
      userKey,
    );
  }

  function handleMarkAllAsRead() {
    if (!userKey) {
      return;
    }

    markAllNotificationsAsRead(
      visibleNotifications.map(
        (notification) => notification.id,
      ),
      userKey,
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Checking access...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Enterprise Communications
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Notifications
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Review system alerts, ticket updates,
              maintenance events, assignments, and
              operational messages relevant to your role.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark All as Read
          </button>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <MetricCard
            label="Total"
            value={visibleNotifications.length}
            description="Visible notifications"
            valueClassName="text-blue-400"
          />

          <MetricCard
            label="Unread"
            value={unreadCount}
            description="Needs your attention"
            valueClassName="text-red-400"
          />

          <MetricCard
            label="Read"
            value={readCount}
            description="Previously reviewed"
            valueClassName="text-green-400"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900">
          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Notification Center
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Showing {filteredNotifications.length}{" "}
                notifications.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {(["All", "Unread", "Read"] as const).map(
                (filterOption) => (
                  <button
                    key={filterOption}
                    type="button"
                    onClick={() =>
                      setFilter(filterOption)
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      filter === filterOption
                        ? "border-blue-500 bg-blue-500/15 text-blue-300"
                        : "border-white/10 bg-zinc-950 text-gray-400 hover:text-white"
                    }`}
                  >
                    {filterOption}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredNotifications.map(
              (notification) => {
                const isRead =
                  notification.readBy
                    .map((reader) =>
                      reader
                        .toLowerCase()
                        .trim(),
                    )
                    .includes(
                      userKey
                        .toLowerCase()
                        .trim(),
                    );

                const notificationType =
                  getNotificationType(
                    notification,
                  );

                return (
                  <article
                    key={notification.id}
                    className={`p-6 transition hover:bg-zinc-800/40 ${
                      isRead
                        ? "opacity-70"
                        : "bg-blue-500/[0.03]"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl ${getTypeClasses(
                            notificationType,
                          )}`}
                        >
                          {getTypeIcon(
                            notificationType,
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {notification.title}
                            </h3>

                            {!isRead && (
                              <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                New
                              </span>
                            )}

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTypeClasses(
                                notificationType,
                              )}`}
                            >
                              {notificationType}
                            </span>
                          </div>

                          <p className="mt-3 max-w-3xl leading-7 text-gray-300">
                            {notification.message}
                          </p>

                          <p className="mt-3 text-xs text-gray-600">
                            {formatDate(
                              notification.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        {notification.href && (
                          <Link
                            href={notification.href}
                            onClick={() =>
                              handleMarkAsRead(
                                notification.id,
                              )
                            }
                            className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                          >
                            Open
                          </Link>
                        )}

                        {!isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(
                                notification.id,
                              )
                            }
                            className="rounded-lg border border-green-500/30 px-4 py-2 text-sm font-semibold text-green-400 transition hover:bg-green-500/10"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              },
            )}

            {filteredNotifications.length === 0 && (
              <div className="px-6 py-20 text-center">
                <p className="text-5xl">
                  🔕
                </p>

                <h3 className="mt-5 text-xl font-semibold">
                  No notifications found
                </h3>

                <p className="mt-2 text-gray-500">
                  There are no notifications matching
                  the selected filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  description,
  valueClassName,
}: {
  label: string;
  value: number;
  description: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p
        className={`mt-4 text-4xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-600">
        {description}
      </p>
    </div>
  );
}

function getTypeIcon(
  type:
    | "Critical"
    | "Warning"
    | "Success"
    | "Information",
) {
  const icons = {
    Critical: "🚨",
    Warning: "⚠️",
    Success: "✅",
    Information: "ℹ️",
  };

  return icons[type];
}

function getTypeClasses(
  type:
    | "Critical"
    | "Warning"
    | "Success"
    | "Information",
) {
  const classes = {
    Critical:
      "border-red-500/30 bg-red-500/10 text-red-400",
    Warning:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Success:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Information:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  return classes[type];
}
