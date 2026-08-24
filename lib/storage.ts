import type { Asset } from "@/types/asset";
import type { Employee } from "@/types/employee";
import type { AssetHistoryRecord } from "@/types/history";
import type { Ticket } from "@/types/ticket";

const STORAGE_KEYS = {
  assets: "assets",
  employees: "employees",
  tickets: "tickets",
  history: "assetHistory",
} as const;

const LEGACY_DELETED_ASSET_IDS_KEY =
  "deletedAssetIds";

const ASSET_STORAGE_MIGRATION_KEY =
  "assetsStorageMigratedV2";

export const ENTERPRISE_DATA_EVENT =
  "enterprise-data-updated";

export type EnterpriseDataType =
  | "assets"
  | "employees"
  | "tickets"
  | "history";

export const defaultAssets: Asset[] = [
  {
    id: "AST-001",
    name: "Dell Latitude 5420",
    category: "Laptop",
    assignedTo: "Ahmed Ali",
    department: "Finance",
    status: "Assigned",
  },
  {
    id: "AST-002",
    name: "HP EliteBook 840",
    category: "Laptop",
    assignedTo: "Sara Mohammed",
    department: "Human Resources",
    status: "Assigned",
  },
  {
    id: "AST-003",
    name: "Dell Monitor P2422H",
    category: "Monitor",
    assignedTo: "",
    department: "IT",
    status: "Available",
  },
  {
    id: "AST-004",
    name: "Cisco Network Switch",
    category: "Network Device",
    assignedTo: "",
    department: "IT",
    status: "Maintenance",
  },
  {
    id: "AST-005",
    name: "Logitech Wireless Mouse",
    category: "Accessory",
    assignedTo: "",
    department: "Operations",
    status: "Available",
  },
];

export const defaultEmployees: Employee[] =
  [];

export const defaultTickets: Ticket[] =
  [];

export const defaultHistory: AssetHistoryRecord[] =
  [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeId(
  value: string,
): string {
  return value.trim().toUpperCase();
}

function readStorageArray<T>(
  key: string,
  fallback: T[] = [],
): T[] {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const savedValue =
      window.localStorage.getItem(key);

    if (!savedValue) {
      return fallback;
    }

    const parsedValue: unknown =
      JSON.parse(savedValue);

    if (!Array.isArray(parsedValue)) {
      return fallback;
    }

    return parsedValue as T[];
  } catch (error) {
    console.error(
      `Failed to read localStorage key "${key}":`,
      error,
    );

    return fallback;
  }
}

function writeStorageArray<T>(
  key: string,
  value: T[],
  dataType: EnterpriseDataType,
): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value),
    );

    dispatchEnterpriseDataUpdate(
      dataType,
    );
  } catch (error) {
    console.error(
      `Failed to save localStorage key "${key}":`,
      error,
    );
  }
}

function mergeById<
  T extends { id: string },
>(
  defaultItems: T[],
  savedItems: T[],
): T[] {
  const itemsMap =
    new Map<string, T>();

  defaultItems.forEach(
    (item) => {
      itemsMap.set(
        normalizeId(item.id),
        item,
      );
    },
  );

  savedItems.forEach(
    (item) => {
      itemsMap.set(
        normalizeId(item.id),
        item,
      );
    },
  );

  return Array.from(
    itemsMap.values(),
  );
}

function dispatchEnterpriseDataUpdate(
  dataType: EnterpriseDataType,
): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      ENTERPRISE_DATA_EVENT,
      {
        detail: {
          dataType,
          updatedAt:
            new Date().toISOString(),
        },
      },
    ),
  );
}

/* =========================
   Assets
========================= */

function migrateLegacyAssets(): Asset[] {
  if (!isBrowser()) {
    return defaultAssets;
  }

  const alreadyMigrated =
    window.localStorage.getItem(
      ASSET_STORAGE_MIGRATION_KEY,
    ) === "true";

  const savedAssets =
    readStorageArray<Asset>(
      STORAGE_KEYS.assets,
    );

  /*
   * After migration, localStorage is
   * the single source of truth.
   */
  if (alreadyMigrated) {
    if (
      window.localStorage.getItem(
        STORAGE_KEYS.assets,
      ) === null
    ) {
      window.localStorage.setItem(
        STORAGE_KEYS.assets,
        JSON.stringify(
          defaultAssets,
        ),
      );

      return defaultAssets;
    }

    return savedAssets;
  }

  /*
   * Build the same list the old system
   * previously displayed:
   *
   * defaults + saved data
   */
  const legacyMergedAssets =
    mergeById(
      defaultAssets,
      savedAssets,
    );

  let deletedAssetIds: string[] =
    [];

  try {
    deletedAssetIds =
      JSON.parse(
        window.localStorage.getItem(
          LEGACY_DELETED_ASSET_IDS_KEY,
        ) || "[]",
      ) as string[];
  } catch {
    deletedAssetIds = [];
  }

  const deletedIds =
    new Set(
      deletedAssetIds.map(
        (id) =>
          normalizeId(id),
      ),
    );

  /*
   * Preserve exactly what the Assets
   * page considered visible before
   * migration.
   */
  const migratedAssets =
    legacyMergedAssets.filter(
      (asset) =>
        !deletedIds.has(
          normalizeId(asset.id),
        ),
    );

  window.localStorage.setItem(
    STORAGE_KEYS.assets,
    JSON.stringify(
      migratedAssets,
    ),
  );

  /*
   * The old workaround is no longer
   * necessary after migration.
   */
  window.localStorage.removeItem(
    LEGACY_DELETED_ASSET_IDS_KEY,
  );

  window.localStorage.setItem(
    ASSET_STORAGE_MIGRATION_KEY,
    "true",
  );

  return migratedAssets;
}

export function getAssets(): Asset[] {
  if (!isBrowser()) {
    return defaultAssets;
  }

  return migrateLegacyAssets();
}

export function saveAssets(
  assets: Asset[],
): void {
  if (isBrowser()) {
    window.localStorage.setItem(
      ASSET_STORAGE_MIGRATION_KEY,
      "true",
    );
  }

  writeStorageArray(
    STORAGE_KEYS.assets,
    assets,
    "assets",
  );
}

export function getAssetById(
  assetId: string,
): Asset | undefined {
  const normalizedAssetId =
    normalizeId(assetId);

  return getAssets().find(
    (asset) =>
      normalizeId(asset.id) ===
      normalizedAssetId,
  );
}

export function addAsset(
  asset: Asset,
): Asset[] {
  const assets = getAssets();

  const alreadyExists =
    assets.some(
      (item) =>
        normalizeId(item.id) ===
        normalizeId(asset.id),
    );

  if (alreadyExists) {
    throw new Error(
      `Asset with ID ${asset.id} already exists.`,
    );
  }

  const updatedAssets = [
    ...assets,
    asset,
  ];

  saveAssets(updatedAssets);

  return updatedAssets;
}

export function updateAsset(
  assetId: string,
  updates: Partial<Asset>,
): Asset[] {
  const normalizedAssetId =
    normalizeId(assetId);

  const updatedAssets =
    getAssets().map(
      (asset) =>
        normalizeId(asset.id) ===
        normalizedAssetId
          ? {
              ...asset,
              ...updates,
              id:
                updates.id ??
                asset.id,
            }
          : asset,
    );

  saveAssets(updatedAssets);

  return updatedAssets;
}

export function deleteAssetById(
  assetId: string,
): Asset[] {
  const normalizedAssetId =
    normalizeId(assetId);

  const updatedAssets =
    getAssets().filter(
      (asset) =>
        normalizeId(asset.id) !==
        normalizedAssetId,
    );

  saveAssets(updatedAssets);

  return updatedAssets;
}

/* =========================
   Employees
========================= */

export function getEmployees(): Employee[] {
  const savedEmployees =
    readStorageArray<Employee>(
      STORAGE_KEYS.employees,
    );

  return mergeById(
    defaultEmployees,
    savedEmployees,
  );
}

export function saveEmployees(
  employees: Employee[],
): void {
  writeStorageArray(
    STORAGE_KEYS.employees,
    employees,
    "employees",
  );
}

export function getEmployeeById(
  employeeId: string,
): Employee | undefined {
  const normalizedEmployeeId =
    normalizeId(employeeId);

  return getEmployees().find(
    (employee) =>
      normalizeId(employee.id) ===
      normalizedEmployeeId,
  );
}

export function addEmployee(
  employee: Employee,
): Employee[] {
  const employees =
    getEmployees();

  const alreadyExists =
    employees.some(
      (item) =>
        normalizeId(item.id) ===
        normalizeId(employee.id),
    );

  if (alreadyExists) {
    throw new Error(
      `Employee with ID ${employee.id} already exists.`,
    );
  }

  const updatedEmployees = [
    ...employees,
    employee,
  ];

  saveEmployees(
    updatedEmployees,
  );

  return updatedEmployees;
}

export function updateEmployee(
  employeeId: string,
  updates: Partial<Employee>,
): Employee[] {
  const normalizedEmployeeId =
    normalizeId(employeeId);

  const updatedEmployees =
    getEmployees().map(
      (employee) =>
        normalizeId(
          employee.id,
        ) ===
        normalizedEmployeeId
          ? {
              ...employee,
              ...updates,
              id:
                updates.id ??
                employee.id,
            }
          : employee,
    );

  saveEmployees(
    updatedEmployees,
  );

  return updatedEmployees;
}

export function deleteEmployeeById(
  employeeId: string,
): Employee[] {
  const normalizedEmployeeId =
    normalizeId(employeeId);

  const updatedEmployees =
    getEmployees().filter(
      (employee) =>
        normalizeId(
          employee.id,
        ) !==
        normalizedEmployeeId,
    );

  saveEmployees(
    updatedEmployees,
  );

  return updatedEmployees;
}

/* =========================
   Tickets
========================= */

export function getTickets(): Ticket[] {
  const savedTickets =
    readStorageArray<Ticket>(
      STORAGE_KEYS.tickets,
    );

  return mergeById(
    defaultTickets,
    savedTickets,
  );
}

export function saveTickets(
  tickets: Ticket[],
): void {
  writeStorageArray(
    STORAGE_KEYS.tickets,
    tickets,
    "tickets",
  );
}

export function getTicketById(
  ticketId: string,
): Ticket | undefined {
  const normalizedTicketId =
    normalizeId(ticketId);

  return getTickets().find(
    (ticket) =>
      normalizeId(ticket.id) ===
      normalizedTicketId,
  );
}

export function getTicketsByAssetId(
  assetId: string,
): Ticket[] {
  const normalizedAssetId =
    normalizeId(assetId);

  return getTickets()
    .filter(
      (ticket) =>
        normalizeId(
          ticket.assetId || "",
        ) ===
        normalizedAssetId,
    )
    .sort(
      (
        firstTicket,
        secondTicket,
      ) =>
        new Date(
          secondTicket.createdAt,
        ).getTime() -
        new Date(
          firstTicket.createdAt,
        ).getTime(),
    );
}

export function addTicket(
  ticket: Ticket,
): Ticket[] {
  const tickets =
    getTickets();

  const alreadyExists =
    tickets.some(
      (item) =>
        normalizeId(item.id) ===
        normalizeId(ticket.id),
    );

  if (alreadyExists) {
    throw new Error(
      `Ticket with ID ${ticket.id} already exists.`,
    );
  }

  const updatedTickets = [
    ...tickets,
    ticket,
  ];

  saveTickets(
    updatedTickets,
  );

  return updatedTickets;
}

export function updateTicket(
  ticketId: string,
  updates: Partial<Ticket>,
): Ticket[] {
  const normalizedTicketId =
    normalizeId(ticketId);

  const updatedTickets =
    getTickets().map(
      (ticket) =>
        normalizeId(
          ticket.id,
        ) ===
        normalizedTicketId
          ? {
              ...ticket,
              ...updates,
              id:
                updates.id ??
                ticket.id,
              updatedAt:
                new Date().toISOString(),
            }
          : ticket,
    );

  saveTickets(
    updatedTickets,
  );

  return updatedTickets;
}

export function deleteTicketById(
  ticketId: string,
): Ticket[] {
  const normalizedTicketId =
    normalizeId(ticketId);

  const updatedTickets =
    getTickets().filter(
      (ticket) =>
        normalizeId(
          ticket.id,
        ) !==
        normalizedTicketId,
    );

  saveTickets(
    updatedTickets,
  );

  return updatedTickets;
}

/* =========================
   Asset History
========================= */

export function getHistory(): AssetHistoryRecord[] {
  return readStorageArray<AssetHistoryRecord>(
    STORAGE_KEYS.history,
    defaultHistory,
  ).sort(
    (
      firstRecord,
      secondRecord,
    ) =>
      new Date(
        secondRecord.changedAt,
      ).getTime() -
      new Date(
        firstRecord.changedAt,
      ).getTime(),
  );
}

export function saveHistory(
  history: AssetHistoryRecord[],
): void {
  writeStorageArray(
    STORAGE_KEYS.history,
    history,
    "history",
  );
}

export function getHistoryByAssetId(
  assetId: string,
): AssetHistoryRecord[] {
  const normalizedAssetId =
    normalizeId(assetId);

  return getHistory().filter(
    (record) =>
      normalizeId(
        record.assetId,
      ) ===
      normalizedAssetId,
  );
}

export function addHistoryRecord(
  record: AssetHistoryRecord,
): AssetHistoryRecord[] {
  const history =
    getHistory();

  const updatedHistory = [
    record,
    ...history,
  ];

  saveHistory(
    updatedHistory,
  );

  return updatedHistory;
}

export function deleteHistoryByAssetId(
  assetId: string,
): AssetHistoryRecord[] {
  const normalizedAssetId =
    normalizeId(assetId);

  const updatedHistory =
    getHistory().filter(
      (record) =>
        normalizeId(
          record.assetId,
        ) !==
        normalizedAssetId,
    );

  saveHistory(
    updatedHistory,
  );

  return updatedHistory;
}

/* =========================
   Complete Enterprise Data
========================= */

export type EnterpriseData = {
  assets: Asset[];
  employees: Employee[];
  tickets: Ticket[];
  history: AssetHistoryRecord[];
};

export function getEnterpriseData(): EnterpriseData {
  return {
    assets: getAssets(),
    employees: getEmployees(),
    tickets: getTickets(),
    history: getHistory(),
  };
}

export function refreshEnterpriseData(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      ENTERPRISE_DATA_EVENT,
      {
        detail: {
          dataType: "all",
          updatedAt:
            new Date().toISOString(),
        },
      },
    ),
  );
}
