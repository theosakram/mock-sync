import { Box, Text } from "@chakra-ui/react";
import { IntegrationCard } from "./IntegrationCard";
import { Integration } from "@/features/sync/modules/syncTypes";

interface IntegrationsListProps {
  integrations: Integration[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLocked?: boolean;
}

export function IntegrationsList({
  integrations,
  selectedId,
  onSelect,
  isLocked,
}: IntegrationsListProps) {
  return (
    <Box
      borderRight="1px solid"
      borderColor="border.subtle"
      display="flex"
      flexDirection="column"
      h="full"
      opacity={isLocked ? 0.5 : 1}
      transition="opacity 0.2s"
    >
      <Box px={4} py={3} borderBottom="1px solid" borderColor="border.subtle">
        <Text fontSize="12px" fontWeight="500" color="fg.muted">
          Integrations
        </Text>
      </Box>

      <Box p={2} flex={1} overflowY="auto">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            isSelected={selectedId === integration.id}
            isLocked={isLocked}
            onClick={() => onSelect(integration.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
