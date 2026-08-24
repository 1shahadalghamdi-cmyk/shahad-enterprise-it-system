type AssignedAsset = {
  id: string;
  name: string;
  type: string;
  serial: string;
  status: "Assigned";
  userId: string;
};

const assignedAssets: AssignedAsset[] = [
  {
    id: "AST-1001",
    name: "Dell Latitude 7440",
    type: "Laptop",
    serial: "DL7440-78291",
    status: "Assigned",
    userId: "USR-1001",
  },
  {
    id: "AST-1002",
    name: 'Dell 27" Monitor',
    type: "Monitor",
    serial: "MN270-92182",
    status: "Assigned",
    userId: "USR-1001",
  },
  {
    id: "AST-1003",
    name: "Logitech MX Keys",
    type: "Keyboard",
    serial: "KB-22391",
    status: "Assigned",
    userId: "USR-1001",
  },
  {
    id: "AST-1004",
    name: "Logitech MX Master",
    type: "Mouse",
    serial: "MS-92191",
    status: "Assigned",
    userId: "USR-1001",
  },
];

export default function AssignedAssets({
  userId,
}: {
  userId: string;
}) {
  const userAssets =
    assignedAssets.filter(
      (asset) =>
        asset.userId === userId,
    );

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

      <h2 className="text-2xl font-bold">
        Assigned Assets
      </h2>

      <p className="mt-2 text-gray-400">
        Devices currently assigned to this employee.
      </p>

      {userAssets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-zinc-950 p-6 text-center">

          <p className="font-semibold text-gray-300">
            No assigned assets
          </p>

          <p className="mt-2 text-sm text-gray-500">
            No devices are currently assigned to this identity.
          </p>

        </div>
      ) : (
        <div className="mt-6 space-y-4">

          {userAssets.map(
            (asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950 p-4"
              >

                <div>

                  <h3 className="font-semibold">
                    {asset.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {asset.type}
                  </p>

                  <p className="text-xs text-gray-600">
                    {asset.serial}
                  </p>

                </div>

                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                  {asset.status}
                </span>

              </div>
            ),
          )}

        </div>
      )}

    </section>
  );
}
