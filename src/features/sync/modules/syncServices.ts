import { apiv1Url } from "@/utils/constants/urls";
import { SyncResponse } from "./syncTypes";

const SYNC_ENDPOINT = `${apiv1Url}/data/sync`;

const APPLICATION_IDS: Record<string, string> = {
  salesforce: "salesforce",
  hubspot: "hubspot",
  stripe: "stripe",
  slack: "slack",
};

export class SyncApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "SyncApiError";
  }
}

export function getSyncErrorMessage(error: unknown): string {
  if (!(error instanceof SyncApiError))
    return "Unexpected error. Please try again.";
  if (error.status >= 400 && error.status < 500)
    return "Configuration issue. Check your integration settings.";
  if (error.status === 500)
    return "Internal server error. The sync service is unavailable.";
  if (error.status === 502)
    return "Gateway error. The integration client is unreachable.";
  return `Sync failed with status ${error.status}.`;
}

export async function triggerSync(
  integrationId: string,
): Promise<SyncResponse> {
  const applicationId = APPLICATION_IDS[integrationId] ?? integrationId;
  const url = `${SYNC_ENDPOINT}?application_id=${applicationId}`;
  const res = await fetch(url);
  if (!res.ok) throw new SyncApiError(res.status, `HTTP ${res.status}`);
  return res.json() as Promise<SyncResponse>;
}
