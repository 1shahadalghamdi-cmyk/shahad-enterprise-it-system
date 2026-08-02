export type AssetHistoryRecord = {
  id: string;
  assetId: string;
  assetName: string;
  action: string;
  previousAssignedTo: string;
  newAssignedTo: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
};
