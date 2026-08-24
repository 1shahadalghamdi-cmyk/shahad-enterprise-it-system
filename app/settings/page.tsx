"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "@/app/components/system/Sidebar";

type SettingsData = {
  systemName: string;
  environment: "Production" | "Staging" | "Development";
  timezone: string;
  ticketNotifications: boolean;
  assetNotifications: boolean;
  backupNotifications: boolean;
  mfaRequired: boolean;
  sessionTimeout: string;
  auditLogging: boolean;
  maintenanceMode: boolean;
};

const SETTINGS_STORAGE_KEY =
  "enterprise-admin-settings";

const defaultSettings: SettingsData = {
  systemName: "Shahad Enterprise IT",
  environment: "Production",
  timezone: "Asia/Riyadh",
  ticketNotifications: true,
  assetNotifications: true,
  backupNotifications: true,
  mfaRequired: true,
  sessionTimeout: "30",
  auditLogging: true,
  maintenanceMode: false,
};

export default function SettingsPage() {
  const [
    settings,
    setSettings,
  ] = useState<SettingsData>(
    defaultSettings
  );

  const [
    settingsLoaded,
    setSettingsLoaded,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    try {
      const savedSettings =
        window.localStorage.getItem(
          SETTINGS_STORAGE_KEY
        );

      if (savedSettings) {
        const parsedSettings =
          JSON.parse(
            savedSettings
          ) as SettingsData;

        setSettings({
          ...defaultSettings,
          ...parsedSettings,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );

      setSettings(
        defaultSettings
      );
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  function updateSetting<
    K extends keyof SettingsData
  >(
    key: K,
    value: SettingsData[K]
  ) {
    setSettings(
      (current) => ({
        ...current,
        [key]: value,
      })
    );

    setMessage("");
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(
          settings
        )
      );

      setMessage(
        "Settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error
      );

      setMessage(
        "Unable to save settings."
      );
    }
  }

  function resetSettings() {
    setSettings(
      defaultSettings
    );

    setMessage(
      "Settings restored to default values. Save changes to confirm."
    );
  }

  if (!settingsLoaded) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">
            Loading settings...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Enterprise Administration
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              System Settings
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Configure administrative
              preferences, notifications,
              security controls, and system
              behavior for the enterprise
              management platform.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Environment"
              value={
                settings.environment
              }
              subtitle="Current system environment"
              valueClass="text-blue-400"
            />

            <Kpi
              title="MFA Policy"
              value={
                settings.mfaRequired
                  ? "Required"
                  : "Optional"
              }
              subtitle="Administrator authentication"
              valueClass={
                settings.mfaRequired
                  ? "text-green-400"
                  : "text-yellow-300"
              }
            />

            <Kpi
              title="Audit Logging"
              value={
                settings.auditLogging
                  ? "Enabled"
                  : "Disabled"
              }
              subtitle="Administrative activity logging"
              valueClass={
                settings.auditLogging
                  ? "text-green-400"
                  : "text-red-400"
              }
            />

            <Kpi
              title="Maintenance"
              value={
                settings.maintenanceMode
                  ? "Active"
                  : "Normal"
              }
              subtitle="Platform operating mode"
              valueClass={
                settings.maintenanceMode
                  ? "text-yellow-300"
                  : "text-green-400"
              }
            />
          </div>

          {message && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                message.includes(
                  "successfully"
                )
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                General Settings
              </h2>

              <p className="mt-2 text-gray-400">
                Configure the enterprise
                platform identity and operating
                environment.
              </p>

              <div className="mt-6 space-y-5">
                <Field
                  label="System Name"
                  value={
                    settings.systemName
                  }
                  onChange={(value) =>
                    updateSetting(
                      "systemName",
                      value
                    )
                  }
                />

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-400">
                    Environment
                  </span>

                  <select
                    value={
                      settings.environment
                    }
                    onChange={(event) =>
                      updateSetting(
                        "environment",
                        event.target
                          .value as SettingsData["environment"]
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="Production">
                      Production
                    </option>

                    <option value="Staging">
                      Staging
                    </option>

                    <option value="Development">
                      Development
                    </option>
                  </select>
                </label>

                <Field
                  label="Timezone"
                  value={
                    settings.timezone
                  }
                  onChange={(value) =>
                    updateSetting(
                      "timezone",
                      value
                    )
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Notification Settings
              </h2>

              <p className="mt-2 text-gray-400">
                Choose which operational
                events generate administrator
                notifications.
              </p>

              <div className="mt-6 space-y-4">
                <ToggleRow
                  title="IT Support Tickets"
                  description="Notify administrators about new and escalated tickets."
                  enabled={
                    settings.ticketNotifications
                  }
                  onChange={(value) =>
                    updateSetting(
                      "ticketNotifications",
                      value
                    )
                  }
                />

                <ToggleRow
                  title="Asset Changes"
                  description="Notify administrators about assignment and asset status changes."
                  enabled={
                    settings.assetNotifications
                  }
                  onChange={(value) =>
                    updateSetting(
                      "assetNotifications",
                      value
                    )
                  }
                />

                <ToggleRow
                  title="Backup & Recovery"
                  description="Notify administrators about failed backup jobs and recovery events."
                  enabled={
                    settings.backupNotifications
                  }
                  onChange={(value) =>
                    updateSetting(
                      "backupNotifications",
                      value
                    )
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Security Settings
              </h2>

              <p className="mt-2 text-gray-400">
                Configure administrator
                authentication and session
                controls.
              </p>

              <div className="mt-6 space-y-4">
                <ToggleRow
                  title="Require MFA"
                  description="Require multi-factor authentication for administrative accounts."
                  enabled={
                    settings.mfaRequired
                  }
                  onChange={(value) =>
                    updateSetting(
                      "mfaRequired",
                      value
                    )
                  }
                />

                <ToggleRow
                  title="Audit Logging"
                  description="Record administrative configuration changes and security events."
                  enabled={
                    settings.auditLogging
                  }
                  onChange={(value) =>
                    updateSetting(
                      "auditLogging",
                      value
                    )
                  }
                />

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-400">
                    Session Timeout
                  </span>

                  <select
                    value={
                      settings.sessionTimeout
                    }
                    onChange={(event) =>
                      updateSetting(
                        "sessionTimeout",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="15">
                      15 minutes
                    </option>

                    <option value="30">
                      30 minutes
                    </option>

                    <option value="60">
                      60 minutes
                    </option>

                    <option value="120">
                      120 minutes
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                System Operations
              </h2>

              <p className="mt-2 text-gray-400">
                Control maintenance and
                platform-wide operating state.
              </p>

              <div className="mt-6">
                <ToggleRow
                  title="Maintenance Mode"
                  description="Place the enterprise portal into maintenance mode for administrative work."
                  enabled={
                    settings.maintenanceMode
                  }
                  onChange={(value) =>
                    updateSetting(
                      "maintenanceMode",
                      value
                    )
                  }
                />
              </div>

              {settings.maintenanceMode && (
                <div className="mt-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="font-semibold text-yellow-300">
                    Maintenance Mode Active
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Administrative maintenance
                    is enabled. User-facing
                    services may be restricted
                    during this period.
                  </p>
                </div>
              )}
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Configuration Management
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Save your changes or restore
                  the default administrative
                  configuration.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={
                    resetSettings
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
                >
                  Reset Defaults
                </button>

                <button
                  type="button"
                  onClick={
                    saveSettings
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Kpi({
  title,
  value,
  subtitle,
  valueClass = "text-white",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-400">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-white/10 bg-zinc-950 p-4">
      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!enabled)
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-zinc-700"
        }`}
        aria-pressed={
          enabled
        }
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
