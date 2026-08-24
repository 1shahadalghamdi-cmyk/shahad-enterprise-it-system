/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  EnterpriseNotification,
  getNotifications,
  getNotificationUserKey,
  isNotificationVisibleToUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from "@/lib/notifications";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type SidebarLink = {
  href: string;
  label: string;
  roles: UserRole[];
};

const links: SidebarLink[] = [
  {
    href: "/dashboard",
    label: "📊 Dashboard",
    roles: ["IT Admin", "IT Support", "Employee"],
  },
  {
    href: "/assets",
    label: "💻 Assets",
    roles: ["IT Admin", "IT Support", "Employee"],
  },
  {
    href: "/tickets",
    label: "🎫 Tickets",
    roles: ["IT Admin", "IT Support", "Employee"],
  },
  {
    href: "/employees",
    label: "👥 Employees",
    roles: ["IT Admin"],
  },
  {
    href: "/departments",
    label: "🏢 Departments",
    roles: ["IT Admin"],
  },
  {
    href: "/maintenance",
    label: "🔧 Maintenance",
    roles: ["IT Admin", "IT Support"],
  },
  {
    href: "/activity-log",
    label: "📜 Activity Log",
    roles: ["IT Admin", "IT Support"],
  },
  {
    href: "/reports",
    label: "📈 Reports",
    roles: ["IT Admin"],
  },
  {
    href: "/settings",
    label: "⚙️ Settings",
    roles: ["IT Admin"],
  },
];

export default function Sidebar() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [notifications, setNotifications] =
    useState<EnterpriseNotification[]>([]);

  const [
    isNotificationPanelOpen,
    setIsNotificationPanelOpen,
  ] = useState(false);

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(savedCurrentUser) as CurrentUser;

      setCurrentUser(parsedUser);
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    function refreshNotifications() {
      setNotifications(getNotifications());
    }

    refreshNotifications();

    return subscribeToNotifications(
      refreshNotifications,
    );
  }, []);

  const visibleLinks = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return links.filter((link) =>
      link.roles.includes(currentUser.role),
    );
  }, [currentUser]);

  const visibleNotifications = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return notifications
      .filter((notification) =>
        isNotificationVisibleToUser(
          notification,
          currentUser,
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

  const userNotificationKey = useMemo(() => {
    if (!currentUser) {
      return "";
    }

    return getNotificationUserKey(currentUser);
  }, [currentUser]);

  const unreadNotificationCount = useMemo(
    () =>
      visibleNotifications.filter(
        (notification) =>
          !notification.readBy.includes(
            userNotificationKey,
          ),
      ).length,
    [
      userNotificationKey,
      visibleNotifications,
    ],
  );

  function handleNotificationClick(
    notification: EnterpriseNotification,
  ) {
    if (!currentUser) {
      return;
    }

    markNotificationAsRead(
      notification.id,
      userNotificationKey,
    );

    setIsNotificationPanelOpen(false);

    if (notification.href) {
      router.push(notification.href);
    }
  }

  function handleMarkAllAsRead() {
    if (!currentUser) {
      return;
    }

    markAllNotificationsAsRead(
      visibleNotifications.map(
        (notification) => notification.id,
      ),
      userNotificationKey,
    );
  }

  function handleLogout() {
    window.localStorage.removeItem("currentUser");
    router.push("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-zinc-900 p-6 text-white">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
          Enterprise IT
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Asset System
        </h1>
      </div>

      {currentUser && (
        <div className="mb-5 rounded-xl border border-white/10 bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Signed in as
          </p>

          <p className="mt-2 font-semibold text-white">
            {currentUser.name}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {currentUser.role}
          </p>
        </div>
      )}

      <div className="relative mb-6">
        <button
          type="button"
          onClick={() =>
            setIsNotificationPanelOpen(
              (currentValue) => !currentValue,
            )
          }
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-left transition hover:border-blue-500/50"
        >
          <span className="flex items-center gap-3">
            <span className="text-lg">🔔</span>
            <span className="font-semibold">
              Notifications
            </span>
          </span>

          {unreadNotificationCount > 0 && (
            <span className="flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              {unreadNotificationCount > 99
                ? "99+"
                : unreadNotificationCount}
            </span>
          )}
        </button>

        {isNotificationPanelOpen && (
          <div className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="font-semibold">
                  Notifications
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {unreadNotificationCount} unread
                </p>
              </div>

              {visibleNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {visibleNotifications.map(
                (notification) => {
                  const isUnread =
                    !notification.readBy.includes(
                      userNotificationKey,
                    );

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification,
                        )
                      }
                      className={`block w-full border-b border-white/5 px-4 py-4 text-left transition last:border-b-0 hover:bg-white/5 ${
                        isUnread
                          ? "bg-blue-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-2">
                          <span
                            className={`block h-2.5 w-2.5 rounded-full ${
                              isUnread
                                ? "bg-blue-500"
                                : "bg-zinc-700"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-sm leading-5 text-gray-400">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-xs text-gray-600">
                            {formatNotificationDate(
                              notification.createdAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}

              {visibleNotifications.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <p className="text-2xl">🔕</p>

                  <p className="mt-3 font-medium text-gray-300">
                    No notifications yet
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    New ticket and maintenance updates
                    will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-4 py-3 text-gray-300 transition hover:bg-blue-600 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

function formatNotificationDate(
  dateValue: string,
) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
