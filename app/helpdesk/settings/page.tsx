"use client";

import Sidebar from "@/app/components/system/Sidebar";

export default function HelpdeskSettingsPage() {
  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-500">
            System Configuration
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Helpdesk Settings
          </h1>

          <p className="mt-2 text-gray-400">
            Configure IT Helpdesk defaults, notifications, SLA policies and technician preferences.
          </p>
        </div>

        <div className="space-y-8">

          {/* General */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-5">
              General
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <Input label="Company Name" value="Enterprise IT" />

              <Input label="Time Zone" value="Asia/Riyadh" />

              <Input label="Language" value="English" />

              <Input label="Date Format" value="DD/MM/YYYY" />

            </div>
          </div>

          {/* Business Hours */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-semibold mb-5">
              Business Hours
            </h2>

            <div className="grid gap-5 md:grid-cols-3">

              <Input label="Start Time" value="08:00 AM" />

              <Input label="End Time" value="05:00 PM" />

              <Input label="Weekend" value="Friday - Saturday" />

            </div>

          </div>

          {/* Notifications */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-semibold mb-5">
              Notifications
            </h2>

            <div className="space-y-4">

              <Toggle text="Email Notifications" />

              <Toggle text="Desktop Notifications" />

              <Toggle text="SMS Alerts" />

            </div>

          </div>

          {/* SLA */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-semibold mb-5">
              SLA Defaults
            </h2>

            <div className="grid gap-5 md:grid-cols-4">

              <Input label="Critical" value="4 Hours" />

              <Input label="High" value="8 Hours" />

              <Input label="Medium" value="24 Hours" />

              <Input label="Low" value="72 Hours" />

            </div>

          </div>

          {/* Technician */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-semibold mb-5">
              Technician Settings
            </h2>

            <div className="space-y-4">

              <Toggle text="Auto Assignment" />

              <Toggle text="Automatic Escalation" />

              <Toggle text="Round Robin Queue" />

            </div>

          </div>

          {/* Security */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-semibold mb-5">
              Security
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <Input label="Session Timeout" value="30 Minutes" />

              <Input label="Password Expiry" value="90 Days" />

            </div>

          </div>

          <div className="flex gap-4">

            <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">
              Save Changes
            </button>

            <button className="rounded-xl border border-white/10 px-6 py-3 hover:bg-zinc-800">
              Reset
            </button>

          </div>

        </div>

      </section>
    </main>
  );
}

function Input({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="mb-2 text-sm text-gray-400">
        {label}
      </p>

      <input
        defaultValue={value}
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
      />

    </div>
  );
}

function Toggle({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950 px-5 py-4">

      <span>
        {text}
      </span>

      <button className="h-7 w-12 rounded-full bg-blue-600"></button>

    </div>
  );
}