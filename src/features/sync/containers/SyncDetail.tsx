import { ChangePreview } from "@/components/atom/ChangePreview";
import { MOCK_HISTORY } from "@/utils/constants/mock-sync-data";
import { Box, Flex, Text, Button, Alert } from "@chakra-ui/react";
import { useSyncFlow } from "../modules/syncHooks";
import { Integration } from "../modules/syncTypes";
import { ConflictResolver } from "./ConflictResolver";
import { SyncHistory } from "./SyncHistory";

interface SyncDetailPanelProps {
  integration: Integration;
  syncFlow: ReturnType<typeof useSyncFlow>;
}

export function SyncDetailPanel({
  integration,
  syncFlow,
}: SyncDetailPanelProps) {
  const {
    state,
    changes,
    resolutions,
    errorMessage,
    sync,
    isSyncing,
    resolveChange,
    applyMerge,
    reset,
  } = syncFlow;

  const conflicts = changes.filter((c) => c.change_type === "UPDATE");
  const nonConflicts = changes.filter((c) => c.change_type !== "UPDATE");

  const statusLine = () => {
    if (state === "conflict")
      return `${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""} need review`;
    if (state === "preview")
      return `${changes.length} change${changes.length > 1 ? "s" : ""} to apply`;
    if (state === "resolved") return "Merge applied";
    if (state === "error") return "Sync failed";
    if (state === "syncing") return "Syncing...";
    return `v${integration.version} · ${integration.lastSyncAt ?? "never synced"}`;
  };

  return (
    <Flex direction="column" h="full" overflowY="auto">
      <Box px={5} py={4} borderBottom="1px solid" borderColor="border.subtle">
        <Flex align="baseline" justify="space-between">
          <Text fontSize="15px" fontWeight="500">
            {integration.name}
          </Text>
          <Text fontSize="11px" color="fg.subtle">
            {statusLine()}
          </Text>
        </Flex>

        <Button
          w="full"
          mt={3}
          size="sm"
          variant="outline"
          loading={isSyncing}
          loadingText="Syncing..."
          disabled={state === "conflict" || state === "resolved"}
          onClick={state === "error" ? reset : sync}
        >
          {state === "error" ? "Retry" : "Sync now"}
        </Button>
      </Box>

      <Box px={5} py={4} flex={1}>
        {state === "error" && errorMessage && (
          <Alert.Root status="error" mb={4} borderRadius="md" size="sm">
            <Alert.Indicator />
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Root>
        )}

        {state === "resolved" && (
          <Alert.Root status="success" mb={4} borderRadius="md" size="sm">
            <Alert.Indicator />
            <Alert.Description>Merge applied successfully.</Alert.Description>
          </Alert.Root>
        )}

        {state === "preview" && (
          <Box mb={6}>
            <ChangePreview changes={changes} />
          </Box>
        )}

        {state === "conflict" && (
          <Box mb={6}>
            {nonConflicts.length > 0 && (
              <Box mb={5}>
                <Text fontSize="11px" color="fg.subtle" mb={2}>
                  Auto-applying {nonConflicts.length} change
                  {nonConflicts.length > 1 ? "s" : ""}
                </Text>
                <ChangePreview changes={nonConflicts} />
              </Box>
            )}
            <ConflictResolver
              changes={changes}
              resolutions={resolutions}
              onResolve={resolveChange}
              onApplyMerge={applyMerge}
            />
          </Box>
        )}

        <SyncHistory items={MOCK_HISTORY} />
      </Box>
    </Flex>
  );
}
