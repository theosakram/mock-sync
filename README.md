# Integration Sync Panel

A frontend-only dashboard for managing bidirectional data sync between a B2B SaaS platform and external services (Salesforce, HubSpot, Stripe, Slack).

## Stack

- Next.js (App Router)
- TypeScript
- Chakra UI v3
- React Query

## Install & run

```bash
yarn install
yarn dev
```

## What it does

Pick an integration on the left, hit **Sync Now**. The app fetches incoming changes from the API, then:

- If there are conflicting fields — shows a side-by-side picker. You choose local or incoming per field, then apply the merge.
- If there are no conflicts — shows a preview of what will be applied.

Past syncs are listed below with expandable field-level diffs.

## Structure

```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── atom/                    # dumb, reusable general components (StatusBadge, IntegrationCard, etc.)
│   └── ui/                      # Chakra UI generated
├── features/
│   └── sync/
│       ├── containers/          # components with logic related to sync feature
│       │   ├── ConflictResolver.tsx
│       │   ├── SyncDetail.tsx
│       │   └── SyncHistory.tsx
│       └── modules/             # business logic & API
│           ├── syncTypes.ts     # types related to sync feature
│           ├── syncService.ts   # fetch call
│           └── syncHooks.ts     # useSyncFlow + React Query
├── providers/
│   └── QueryProvider.tsx        # react-query provider
└── utils/
    └── constants/
        ├── urls.ts              # API URLs
        └── mock-sync-data.ts    # mock integrations + history
```

## How it's structured

All sync logic lives in `features/sync/modules`. Containers receive state and callbacks as props — no business logic inside them.

The sync flow is a state machine in `syncHooks.ts`:

```
idle → syncing → conflict  → resolved
                ↘ preview
       error
```

## What's real vs mocked

| Thing | Real API | Mocked |
|---|---|---|
| Conflict / change data | ✅ | |
| Integration list | | ✅ |
| Sync history | | ✅ |

The only real API call is `GET /api/v1/data/sync?application_id=<id>` triggered by the Sync Now button.

## Assumptions

- All changes returned by the API are treated as conflicts requiring review (`UPDATE` = user picks, `CREATE`/`DELETE` = auto-applied but shown transparently before merge)
- `application_id` maps 1:1 with the integration ID — real values would come from Portier's config
- The Door entity has no external sync source (the API doesn't return door fields) so it's excluded
- Conflict resolutions default to the incoming (remote) value — assuming the external service is generally the source of truth
- History is mocked since there's no history endpoint — in production this would be a separate API call

## Design decisions

- **State machine over ad-hoc booleans** — sync flow has clear states (`idle`, `syncing`, `conflict`, `preview`, `resolved`, `error`). Easier to reason about and extend.
- **`useSyncFlow` lifted to page level** — so `isSyncing` is accessible to the integration list, which locks selection during a sync. Prevents stale state bleeding between integrations.
- **Resolutions keyed by `change.id` not `field_name`** — the API can return multiple changes for the same field (different records). `field_name` as key would cause silent overwrites.
- **`SyncApiError` as a typed class** — lets you `instanceof` check in catch blocks and map status codes to specific user-facing messages cleanly.
- **No filter/search on integrations** — out of scope per the spec, and overengineering for 4 items.