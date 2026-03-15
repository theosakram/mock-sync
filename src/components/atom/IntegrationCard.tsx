import { Box, Flex, Text } from "@chakra-ui/react";
import { StatusBadge } from "./StatusBadge";
import { Integration } from "@/features/sync/modules/syncTypes";

interface IntegrationCardProps {
  integration: Integration;
  isSelected: boolean;
  isLocked?: boolean;
  onClick: () => void;
}

export function IntegrationCard({
  integration,
  isSelected,
  isLocked,
  onClick,
}: IntegrationCardProps) {
  return (
    <Flex
      px={3}
      py={2}
      borderRadius="md"
      border="1px solid"
      borderColor={isSelected ? "border.emphasized" : "transparent"}
      bg={isSelected ? "bg.subtle" : "transparent"}
      cursor={isLocked ? "not-allowed" : "pointer"}
      onClick={isLocked ? undefined : onClick}
      _hover={isLocked ? {} : { bg: "bg.subtle" }}
      transition="background 0.15s"
      align="center"
      justify="space-between"
      mb={1}
    >
      <Box>
        <Text fontSize="13px" fontWeight="500">
          {integration.name}
        </Text>
        <Text fontSize="11px" color="fg.subtle" mt="1px">
          {integration.version} · {integration.lastSyncAt ?? "never synced"}
        </Text>
      </Box>
      <StatusBadge status={integration.status} />
    </Flex>
  );
}
