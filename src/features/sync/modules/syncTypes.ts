export type IntegrationStatus = "synced" | "syncing" | "conflict" | "error";

export type SyncFlowState =
  | "idle"
  | "syncing"
  | "preview"
  | "conflict"
  | "resolved"
  | "error";

export type ChangeType = "UPDATE" | "CREATE" | "DELETE";

export interface Change {
  id: string;
  field_name: string;
  change_type: ChangeType;
  current_value: string;
  new_value: string;
}

export interface SyncApproval {
  application_name: string;
  changes: Change[];
}

export interface SyncResponse {
  code: string;
  message: string;
  data: {
    sync_approval: SyncApproval;
    metadata: Record<string, unknown>;
  };
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  version: string;
  lastSyncAt: string | null;
  errorCode?: number;
  changeCount?: number;
}

export interface HistoryItem {
  id: string;
  type: "success" | "conflict" | "error";
  message: string;
  timestamp: string;
  version: string;
  changes: Change[];
}

export type ConflictResolutions = Record<string, "local" | "remote">;
