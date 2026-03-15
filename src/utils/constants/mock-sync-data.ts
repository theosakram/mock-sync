import { HistoryItem, Integration } from "@/features/sync/modules/syncTypes";

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM · users, accounts",
    status: "conflict",
    version: "1.4.2",
    lastSyncAt: "3 minutes ago",
    changeCount: 4,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM · contacts, deals",
    status: "synced",
    version: "2.1.0",
    lastSyncAt: "12 minutes ago",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payments · subscriptions",
    status: "syncing",
    version: "3.0.1",
    lastSyncAt: "1 minute ago",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Comms · users",
    status: "error",
    version: "1.2.0",
    lastSyncAt: "20 minutes ago",
    errorCode: 502,
  },
];

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "h1",
    type: "conflict",
    message: "Sync paused — 2 conflicts detected",
    timestamp: "Today, 14:22",
    version: "v1.4.2",
    changes: [
      {
        id: "c1",
        field_name: "user.email",
        change_type: "UPDATE",
        current_value: "alice@old.com",
        new_value: "alice@company.com",
      },
      {
        id: "c2",
        field_name: "user.role",
        change_type: "UPDATE",
        current_value: "guest",
        new_value: "admin",
      },
    ],
  },
  {
    id: "h2",
    type: "success",
    message: "Synced 3 fields successfully · v1.4.1 → v1.4.2",
    timestamp: "Today, 14:10",
    version: "v1.4.1",
    changes: [
      {
        id: "c3",
        field_name: "user.name",
        change_type: "UPDATE",
        current_value: "Alice T.",
        new_value: "Alice Tan",
      },
      {
        id: "c4",
        field_name: "key.status",
        change_type: "UPDATE",
        current_value: "active",
        new_value: "revoked",
      },
      {
        id: "c5",
        field_name: "door.status",
        change_type: "CREATE",
        current_value: "",
        new_value: "online",
      },
    ],
  },
  {
    id: "h3",
    type: "success",
    message: "Full sync completed · 4 records updated",
    timestamp: "Yesterday, 09:44",
    version: "v1.4.0",
    changes: [
      {
        id: "c6",
        field_name: "user.phone",
        change_type: "UPDATE",
        current_value: "+6590001111",
        new_value: "+6590009999",
      },
      {
        id: "c7",
        field_name: "key.access_end",
        change_type: "UPDATE",
        current_value: "2025-12-31T18:00:00Z",
        new_value: "2026-03-31T18:00:00Z",
      },
      {
        id: "c8",
        field_name: "key.key_type",
        change_type: "DELETE",
        current_value: "temporary",
        new_value: "",
      },
      {
        id: "c9",
        field_name: "user.status",
        change_type: "UPDATE",
        current_value: "suspended",
        new_value: "active",
      },
    ],
  },
];
