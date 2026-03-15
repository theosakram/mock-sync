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
  if (!(error instanceof SyncApiError)) {
    return "Unexpected error. Please try again.";
  }

  const { status } = error;
  if (status === 502) {
    return "Gateway error. The integration client is unreachable.";
  }

  if (status === 500) {
    return "Internal server error. The sync service is unavailable.";
  }

  if (status >= 400 && status < 500) {
    return "Configuration issue. Check your integration settings.";
  }

  return `Sync failed with status ${status}.`;
}

export async function triggerSync(
  integrationId: string,
): Promise<SyncResponse> {
  //   return {
  //   code: 'SUCCESS',
  //   message: 'mock',
  //   data: {
  //     sync_approval: {
  //       application_name: integrationId,
  //       changes: [
  //         { id: 'x1', field_name: 'user.email', change_type: 'CREATE', current_value: '', new_value: 'new@corp.com' },
  //         { id: 'x2', field_name: 'key.status', change_type: 'DELETE', current_value: 'active', new_value: '' },
  //       ],
  //     },
  //     metadata: {},
  //   },
  // }

  const applicationId = APPLICATION_IDS[integrationId] ?? integrationId;
  const url = `${SYNC_ENDPOINT}?application_id=${applicationId}`;
  const res = await fetch(url);
  if (!res.ok) throw new SyncApiError(res.status, `HTTP ${res.status}`);
  return res.json() as Promise<SyncResponse>;
}
