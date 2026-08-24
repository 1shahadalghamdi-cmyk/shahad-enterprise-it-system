export type TeamVisibility =
  | "Private"
  | "Public";

export type TeamRecord = {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  channels: string[];
  visibility: TeamVisibility;
};

const TEAMS_STORAGE_KEY = "m365Teams";

export const defaultTeams: TeamRecord[] = [
  {
    id: "TEAM-001",
    name: "IT Operations",
    ownerId: "M365-001",
    members: [
      "M365-001",
      "M365-002",
    ],
    channels: [
      "General",
      "IT Support",
      "Infrastructure",
      "Security",
      "Announcements",
    ],
    visibility: "Private",
  },
  {
    id: "TEAM-002",
    name: "HR Collaboration",
    ownerId: "M365-003",
    members: ["M365-003"],
    channels: [
      "General",
      "Recruitment",
      "HR Operations",
    ],
    visibility: "Private",
  },
  {
    id: "TEAM-003",
    name: "Company Announcements",
    ownerId: "M365-001",
    members: [
      "M365-001",
      "M365-002",
      "M365-003",
    ],
    channels: [
      "General",
      "Announcements",
    ],
    visibility: "Public",
  },
];

export function loadTeams(): TeamRecord[] {
  if (typeof window === "undefined") {
    return defaultTeams;
  }

  const saved =
    window.localStorage.getItem(
      TEAMS_STORAGE_KEY,
    );

  if (!saved) {
    saveTeams(defaultTeams);
    return defaultTeams;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      saveTeams(defaultTeams);
      return defaultTeams;
    }

    /*
      Migration:
      The old Teams page stored
      channels as a number.

      Example:
      channels: 5

      The new system stores actual
      channel names.

      Example:
      channels: ["General", ...]
    */
    const migratedTeams: TeamRecord[] =
      parsed.map((team) => {
        if (Array.isArray(team.channels)) {
          return team as TeamRecord;
        }

        const channelCount =
          typeof team.channels === "number"
            ? team.channels
            : 1;

        const channels = Array.from(
          {
            length: Math.max(
              channelCount,
              1,
            ),
          },
          (_, index) =>
            index === 0
              ? "General"
              : `Channel ${index + 1}`,
        );

        return {
          ...team,
          channels,
        } as TeamRecord;
      });

    saveTeams(migratedTeams);

    return migratedTeams;
  } catch {
    saveTeams(defaultTeams);
    return defaultTeams;
  }
}

export function saveTeams(
  teams: TeamRecord[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TEAMS_STORAGE_KEY,
    JSON.stringify(teams),
  );
}

export function getTeam(
  teamId: string,
): TeamRecord | undefined {
  return loadTeams().find(
    (team) => team.id === teamId,
  );
}

export function createTeamId(
  teams: TeamRecord[],
): string {
  const numbers = teams
    .map((team) => {
      const match =
        team.id.match(/^TEAM-(\d+)$/);

      return match
        ? Number(match[1])
        : 0;
    })
    .filter(
      (number) =>
        Number.isFinite(number),
    );

  const nextNumber =
    Math.max(0, ...numbers) + 1;

  return `TEAM-${String(
    nextNumber,
  ).padStart(3, "0")}`;
}