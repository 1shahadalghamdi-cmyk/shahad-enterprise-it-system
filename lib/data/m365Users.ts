export type M365ServiceStatus =
  | "Enabled"
  | "Disabled";

export type M365AccountStatus =
  | "Active"
  | "Disabled";

export type M365User = {
  id: string;
  name: string;
  username: string;
  email: string;
  jobTitle: string;
  department: string;
  license: string;

  exchange: M365ServiceStatus;
  teams: M365ServiceStatus;
  oneDrive: M365ServiceStatus;
  mfa: M365ServiceStatus;

  status: M365AccountStatus;
};

export const M365_STORAGE_KEY =
  "m365Users";

export const defaultM365Users: M365User[] = [
  {
    id: "M365-001",
    name: "Shahad AlGhamdi",
    username: "shahad.alghamdi",
    email:
      "shahad.alghamdi@enterprise.com",
    jobTitle: "IT Administrator",
    department:
      "Information Technology",
    license: "Microsoft 365 E5",
    exchange: "Enabled",
    teams: "Enabled",
    oneDrive: "Enabled",
    mfa: "Enabled",
    status: "Active",
  },
  {
    id: "M365-002",
    name: "Mohammed Saleh",
    username: "mohammed.saleh",
    email: "m.saleh@enterprise.com",
    jobTitle:
      "IT Support Specialist",
    department:
      "Information Technology",
    license: "Microsoft 365 E3",
    exchange: "Enabled",
    teams: "Enabled",
    oneDrive: "Enabled",
    mfa: "Enabled",
    status: "Active",
  },
  {
    id: "M365-003",
    name: "Sarah Hassan",
    username: "sarah.hassan",
    email:
      "sarah.hassan@enterprise.com",
    jobTitle: "HR Specialist",
    department:
      "Human Resources",
    license: "Business Premium",
    exchange: "Enabled",
    teams: "Enabled",
    oneDrive: "Enabled",
    mfa: "Disabled",
    status: "Active",
  },
  {
    id: "M365-004",
    name: "Juman AlHarbi",
    username: "juman.al",
    email: "juman@enterprise.com",
    jobTitle:
      "Administrative Specialist",
    department: "Administration",
    license: "Business Standard",
    exchange: "Disabled",
    teams: "Disabled",
    oneDrive: "Enabled",
    mfa: "Disabled",
    status: "Active",
  },
  {
    id: "M365-005",
    name: "Noura Alqahtani",
    username: "noura.alqahtani",
    email:
      "noura.alqahtani@enterprise.com",
    jobTitle: "Systems Analyst",
    department:
      "Information Technology",
    license: "Microsoft 365 E3",
    exchange: "Enabled",
    teams: "Enabled",
    oneDrive: "Enabled",
    mfa: "Enabled",
    status: "Active",
  },
];

type LegacyM365User =
  Partial<M365User> & {
    accountStatus?:
      | "Active"
      | "Disabled";
  };

function normalizeServiceStatus(
  value: unknown,
  fallback: M365ServiceStatus,
): M365ServiceStatus {
  if (
    value === "Enabled" ||
    value === "Disabled"
  ) {
    return value;
  }

  return fallback;
}

function normalizeAccountStatus(
  user: LegacyM365User,
  fallback: M365AccountStatus,
): M365AccountStatus {
  /*
   * Migration from the temporary
   * accountStatus field previously
   * used by the Users page.
   */
  if (
    user.accountStatus ===
      "Active" ||
    user.accountStatus ===
      "Disabled"
  ) {
    return user.accountStatus;
  }

  if (
    user.status === "Active" ||
    user.status === "Disabled"
  ) {
    return user.status;
  }

  return fallback;
}

function buildFallbackUser(
  user: LegacyM365User,
  index: number,
): M365User {
  const id =
    typeof user.id === "string" &&
    user.id.trim()
      ? user.id
      : `M365-${String(
          index + 1,
        ).padStart(3, "0")}`;

  const name =
    typeof user.name === "string" &&
    user.name.trim()
      ? user.name
      : "Unknown User";

  const email =
    typeof user.email === "string"
      ? user.email
      : "";

  const username =
    typeof user.username ===
      "string" &&
    user.username.trim()
      ? user.username
      : email.includes("@")
        ? email.split("@")[0]
        : name
            .toLowerCase()
            .replace(/\s+/g, ".");

  return {
    id,
    name,
    username,
    email,

    jobTitle:
      typeof user.jobTitle ===
        "string" &&
      user.jobTitle.trim()
        ? user.jobTitle
        : "Not configured",

    department:
      typeof user.department ===
        "string" &&
      user.department.trim()
        ? user.department
        : "Not configured",

    license:
      typeof user.license ===
        "string" &&
      user.license.trim()
        ? user.license
        : "Unlicensed",

    exchange:
      normalizeServiceStatus(
        user.exchange,
        "Disabled",
      ),

    teams:
      normalizeServiceStatus(
        user.teams,
        "Disabled",
      ),

    oneDrive:
      normalizeServiceStatus(
        user.oneDrive,
        "Disabled",
      ),

    mfa:
      normalizeServiceStatus(
        user.mfa,
        "Disabled",
      ),

    status:
      normalizeAccountStatus(
        user,
        "Active",
      ),
  };
}

function migrateUser(
  user: LegacyM365User,
  index: number,
): M365User {
  const defaultUser =
    defaultM365Users.find(
      (item) =>
        item.id === user.id,
    );

  const fallback =
    defaultUser ??
    buildFallbackUser(
      user,
      index,
    );

  return {
    id:
      user.id ||
      fallback.id,

    name:
      user.name ||
      fallback.name,

    username:
      user.username ||
      fallback.username,

    email:
      user.email ||
      fallback.email,

    jobTitle:
      user.jobTitle ||
      fallback.jobTitle,

    department:
      user.department ||
      fallback.department,

    license:
      user.license ||
      fallback.license,

    exchange:
      normalizeServiceStatus(
        user.exchange,
        fallback.exchange,
      ),

    teams:
      normalizeServiceStatus(
        user.teams,
        fallback.teams,
      ),

    oneDrive:
      normalizeServiceStatus(
        user.oneDrive,
        fallback.oneDrive,
      ),

    mfa:
      normalizeServiceStatus(
        user.mfa,
        fallback.mfa,
      ),

    status:
      normalizeAccountStatus(
        user,
        fallback.status,
      ),
  };
}

export function loadM365Users(): M365User[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultM365Users;
  }

  const savedUsers =
    window.localStorage.getItem(
      M365_STORAGE_KEY,
    );

  if (!savedUsers) {
    window.localStorage.setItem(
      M365_STORAGE_KEY,
      JSON.stringify(
        defaultM365Users,
      ),
    );

    return defaultM365Users;
  }

  try {
    const parsedUsers =
      JSON.parse(
        savedUsers,
      ) as LegacyM365User[];

    if (
      !Array.isArray(
        parsedUsers,
      )
    ) {
      window.localStorage.setItem(
        M365_STORAGE_KEY,
        JSON.stringify(
          defaultM365Users,
        ),
      );

      return defaultM365Users;
    }

    const migratedUsers =
      parsedUsers.map(
        (user, index) =>
          migrateUser(
            user,
            index,
          ),
      );

    window.localStorage.setItem(
      M365_STORAGE_KEY,
      JSON.stringify(
        migratedUsers,
      ),
    );

    return migratedUsers;
  } catch {
    window.localStorage.setItem(
      M365_STORAGE_KEY,
      JSON.stringify(
        defaultM365Users,
      ),
    );

    return defaultM365Users;
  }
}

export function saveM365Users(
  users: M365User[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    M365_STORAGE_KEY,
    JSON.stringify(users),
  );
}

export function getM365User(
  userId: string,
) {
  return loadM365Users().find(
    (user) =>
      user.id === userId,
  );
}

export function getNextM365UserId(
  users: M365User[],
) {
  const highestNumber =
    users.reduce(
      (
        highest,
        user,
      ) => {
        const number =
          Number(
            user.id.replace(
              "M365-",
              "",
            ),
          );

        if (
          Number.isNaN(
            number,
          )
        ) {
          return highest;
        }

        return Math.max(
          highest,
          number,
        );
      },
      0,
    );

  return `M365-${String(
    highestNumber + 1,
  ).padStart(3, "0")}`;
}
