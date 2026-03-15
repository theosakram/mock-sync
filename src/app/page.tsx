"use client";

import { useState } from "react";
import { Box, Grid, GridItem, Text, Flex } from "@chakra-ui/react";
import { IntegrationsList } from "@/components/atom/IntegrationList";
import { SyncDetailPanel } from "@/features/sync/containers/SyncDetail";
import { useSyncFlow } from "@/features/sync/modules/syncHooks";
import { MOCK_INTEGRATIONS } from "@/utils/constants/mock-sync-data";

export default function SyncPanelPage() {
  const [selectedId, setSelectedId] = useState<string>(
    MOCK_INTEGRATIONS[0]?.id ?? "",
  );
  const selectedIntegration =
    MOCK_INTEGRATIONS.find((i) => i.id === selectedId) ?? null;
  const syncFlow = useSyncFlow(selectedId);

  const handleSelect = (id: string) => {
    if (syncFlow.isSyncing) return;
    if (id !== selectedId) syncFlow.reset();
    setSelectedId(id);
  };

  return (
    <Flex direction="column" h="100vh" bg="bg.canvas">
      <Box px={6} py={4} borderBottom="1px solid" borderColor="border.subtle">
        <Text fontSize="14px" fontWeight="500">
          Integration sync
        </Text>
      </Box>

      <Box flex={1} p={6} overflow="hidden">
        <Grid
          templateColumns="repeat(4, 1fr)"
          h="full"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="lg"
          overflow="hidden"
          bg="bg"
        >
          <GridItem overflow="hidden" colSpan={2}>
            <IntegrationsList
              integrations={MOCK_INTEGRATIONS}
              selectedId={selectedId}
              onSelect={handleSelect}
              isLocked={syncFlow.isSyncing}
            />
          </GridItem>

          <GridItem
            borderLeft="1px solid"
            borderColor="border.subtle"
            overflow="hidden"
            colSpan={2}
          >
            {selectedIntegration ? (
              <SyncDetailPanel
                integration={selectedIntegration}
                syncFlow={syncFlow}
              />
            ) : (
              <Flex h="full" align="center" justify="center">
                <Text fontSize="13px" color="fg.subtle">
                  Select an integration
                </Text>
              </Flex>
            )}
          </GridItem>
        </Grid>
      </Box>
    </Flex>
  );
}
