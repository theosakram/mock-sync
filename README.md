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
│   └── ReactQueryProvider.tsx
└── utils/
    └── constants/
        ├── urls.ts              # API URLs.
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