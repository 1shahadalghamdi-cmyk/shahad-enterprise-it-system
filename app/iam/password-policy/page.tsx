"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "@/app/components/system/Sidebar";

type PolicyToggleProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
};

type PasswordPolicy = {
  minimumLength: string;
  expiryDays: string;
  historyCount: string;
  lockoutAttempts: string;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  preventReuse: boolean;
  lockoutEnabled: boolean;
};

const STORAGE_KEY =
  "iamPasswordPolicy";

const defaultPasswordPolicy: PasswordPolicy =
  {
    minimumLength: "12",
    expiryDays: "90",
    historyCount: "10",
    lockoutAttempts: "5",
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    preventReuse: true,
    lockoutEnabled: true,
  };

function loadPasswordPolicy(): PasswordPolicy {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultPasswordPolicy;
  }

  const savedPolicy =
    window.localStorage.getItem(
      STORAGE_KEY,
    );

  if (!savedPolicy) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        defaultPasswordPolicy,
      ),
    );

    return defaultPasswordPolicy;
  }

  try {
    const parsedPolicy =
      JSON.parse(
        savedPolicy,
      ) as PasswordPolicy;

    return {
      ...defaultPasswordPolicy,
      ...parsedPolicy,
    };
  } catch {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        defaultPasswordPolicy,
      ),
    );

    return defaultPasswordPolicy;
  }
}

function savePasswordPolicy(
  policy: PasswordPolicy,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(policy),
  );
}

export default function PasswordPolicyPage() {
  const [
    minimumLength,
    setMinimumLength,
  ] = useState("12");

  const [
    expiryDays,
    setExpiryDays,
  ] = useState("90");

  const [
    historyCount,
    setHistoryCount,
  ] = useState("10");

  const [
    lockoutAttempts,
    setLockoutAttempts,
  ] = useState("5");

  const [
    requireUppercase,
    setRequireUppercase,
  ] = useState(true);

  const [
    requireLowercase,
    setRequireLowercase,
  ] = useState(true);

  const [
    requireNumber,
    setRequireNumber,
  ] = useState(true);

  const [
    requireSpecial,
    setRequireSpecial,
  ] = useState(true);

  const [
    preventReuse,
    setPreventReuse,
  ] = useState(true);

  const [
    lockoutEnabled,
    setLockoutEnabled,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const policy =
      loadPasswordPolicy();

    setMinimumLength(
      policy.minimumLength,
    );

    setExpiryDays(
      policy.expiryDays,
    );

    setHistoryCount(
      policy.historyCount,
    );

    setLockoutAttempts(
      policy.lockoutAttempts,
    );

    setRequireUppercase(
      policy.requireUppercase,
    );

    setRequireLowercase(
      policy.requireLowercase,
    );

    setRequireNumber(
      policy.requireNumber,
    );

    setRequireSpecial(
      policy.requireSpecial,
    );

    setPreventReuse(
      policy.preventReuse,
    );

    setLockoutEnabled(
      policy.lockoutEnabled,
    );

    setLoading(false);
  }, []);

  function clearMessage() {
    if (message) {
      setMessage("");
    }
  }

  function savePolicy() {
    const minimum =
      Number(minimumLength);

    const expiry =
      Number(expiryDays);

    const history =
      Number(historyCount);

    const lockout =
      Number(lockoutAttempts);

    if (
      !Number.isFinite(minimum) ||
      minimum < 1
    ) {
      setMessage(
        "Minimum password length must be at least 1.",
      );

      return;
    }

    if (
      !Number.isFinite(expiry) ||
      expiry < 1
    ) {
      setMessage(
        "Password expiration must be at least 1 day.",
      );

      return;
    }

    if (
      !Number.isFinite(history) ||
      history < 1
    ) {
      setMessage(
        "Password history must be at least 1.",
      );

      return;
    }

    if (
      !Number.isFinite(lockout) ||
      lockout < 1
    ) {
      setMessage(
        "Lockout threshold must be at least 1 attempt.",
      );

      return;
    }

    const policy: PasswordPolicy = {
      minimumLength,
      expiryDays,
      historyCount,
      lockoutAttempts,
      requireUppercase,
      requireLowercase,
      requireNumber,
      requireSpecial,
      preventReuse,
      lockoutEnabled,
    };

    savePasswordPolicy(
      policy,
    );

    setMessage(
      "Password policy updated successfully.",
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading password policy...
        </p>
      </main>
    );
  }

  const successMessage =
    message ===
    "Password policy updated successfully.";

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Identity & Access Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Password Policy
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Configure enterprise password
              complexity, expiration, password
              history, and account lockout
              controls.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Minimum Length"
              value={`${minimumLength} characters`}
              subtitle="Required password length"
              valueClass="text-blue-400"
            />

            <StatCard
              title="Password Expiry"
              value={`${expiryDays} days`}
              subtitle="Maximum password age"
              valueClass="text-yellow-400"
            />

            <StatCard
              title="Password History"
              value={historyCount}
              subtitle="Previous passwords blocked"
              valueClass="text-purple-400"
            />

            <StatCard
              title="Lockout Threshold"
              value={`${lockoutAttempts} attempts`}
              subtitle="Failed sign-in limit"
              valueClass="text-red-400"
            />

          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

              <h2 className="text-2xl font-semibold">
                Password Requirements
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Define password strength and
                lifecycle requirements.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <Field
                  label="Minimum Password Length"
                  value={minimumLength}
                  onChange={(value) => {
                    setMinimumLength(
                      value,
                    );
                    clearMessage();
                  }}
                  suffix="characters"
                />

                <Field
                  label="Password Expiration"
                  value={expiryDays}
                  onChange={(value) => {
                    setExpiryDays(
                      value,
                    );
                    clearMessage();
                  }}
                  suffix="days"
                />

                <Field
                  label="Password History"
                  value={historyCount}
                  onChange={(value) => {
                    setHistoryCount(
                      value,
                    );
                    clearMessage();
                  }}
                  suffix="passwords"
                />

                <Field
                  label="Lockout Threshold"
                  value={lockoutAttempts}
                  onChange={(value) => {
                    setLockoutAttempts(
                      value,
                    );
                    clearMessage();
                  }}
                  suffix="attempts"
                />

              </div>

              <div className="mt-8 space-y-3">

                <PolicyToggle
                  title="Require uppercase letters"
                  description="Password must contain at least one uppercase character."
                  enabled={requireUppercase}
                  onChange={() => {
                    setRequireUppercase(
                      (value) =>
                        !value,
                    );
                    clearMessage();
                  }}
                />

                <PolicyToggle
                  title="Require lowercase letters"
                  description="Password must contain at least one lowercase character."
                  enabled={requireLowercase}
                  onChange={() => {
                    setRequireLowercase(
                      (value) =>
                        !value,
                    );
                    clearMessage();
                  }}
                />

                <PolicyToggle
                  title="Require numbers"
                  description="Password must contain at least one numeric character."
                  enabled={requireNumber}
                  onChange={() => {
                    setRequireNumber(
                      (value) =>
                        !value,
                    );
                    clearMessage();
                  }}
                />

                <PolicyToggle
                  title="Require special characters"
                  description="Password must contain at least one symbol."
                  enabled={requireSpecial}
                  onChange={() => {
                    setRequireSpecial(
                      (value) =>
                        !value,
                    );
                    clearMessage();
                  }}
                />

              </div>

            </section>

            <section className="space-y-6">

              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

                <h2 className="text-2xl font-semibold">
                  Account Protection
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Reduce credential attacks and
                  password reuse.
                </p>

                <div className="mt-6 space-y-3">

                  <PolicyToggle
                    title="Prevent password reuse"
                    description={`Block the previous ${historyCount} passwords from being reused.`}
                    enabled={preventReuse}
                    onChange={() => {
                      setPreventReuse(
                        (value) =>
                          !value,
                      );
                      clearMessage();
                    }}
                  />

                  <PolicyToggle
                    title="Account lockout"
                    description={`Lock an account after ${lockoutAttempts} failed sign-in attempts.`}
                    enabled={lockoutEnabled}
                    onChange={() => {
                      setLockoutEnabled(
                        (value) =>
                          !value,
                      );
                      clearMessage();
                    }}
                  />

                </div>

              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Policy Summary
                </p>

                <h2 className="mt-3 text-xl font-bold">
                  Enterprise Password Standard
                </h2>

                <div className="mt-5 space-y-3 text-sm text-gray-300">

                  <SummaryRow
                    label="Minimum length"
                    value={`${minimumLength} characters`}
                  />

                  <SummaryRow
                    label="Maximum age"
                    value={`${expiryDays} days`}
                  />

                  <SummaryRow
                    label="History"
                    value={`${historyCount} passwords`}
                  />

                  <SummaryRow
                    label="Lockout"
                    value={
                      lockoutEnabled
                        ? `${lockoutAttempts} failed attempts`
                        : "Disabled"
                    }
                  />

                  <SummaryRow
                    label="Complexity"
                    value={
                      requireUppercase &&
                      requireLowercase &&
                      requireNumber &&
                      requireSpecial
                        ? "Strong"
                        : "Custom"
                    }
                  />

                </div>

              </div>

              <button
                type="button"
                onClick={savePolicy}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                Save Password Policy
              </button>

              {message && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    successMessage
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {message}
                </div>
              )}

            </section>

          </div>

        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  valueClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${valueClass}`}
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
  suffix,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  suffix: string;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm text-gray-400">
        {label}
      </span>

      <div className="flex items-center overflow-hidden rounded-xl border border-white/10 bg-zinc-950">

        <input
          type="number"
          min="1"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
        />

        <span className="border-l border-white/10 px-4 text-xs text-gray-500">
          {suffix}
        </span>

      </div>

    </label>
  );
}

function PolicyToggle({
  title,
  description,
  enabled,
  onChange,
}: PolicyToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4">

      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-zinc-700"
        }`}
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

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">

      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}