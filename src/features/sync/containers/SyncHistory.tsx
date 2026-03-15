import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { HistoryItem } from "../modules/syncTypes";
import { ChangePreview } from "@/components/atom/ChangePreview";

const dotColor: Record<HistoryItem["type"], string> = {
  success: "green.500",
  conflict: "orange.400",
  error: "red.500",
};

function HistoryRow({ item }: { item: HistoryItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      borderBottom="1px solid"
      borderColor="border.subtle"
      _last={{ borderBottom: "none" }}
    >
      <Flex
        py={2}
        gap={3}
        align="center"
        cursor="pointer"
        onClick={() => setExpanded((v) => !v)}
        _hover={{ bg: "bg.subtle" }}
        px={1}
        borderRadius="sm"
      >
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg={dotColor[item.type]}
          flexShrink={0}
        />
        <Text fontSize="12px" color="fg.muted" flex={1}>
          {item.message}
        </Text>
        <Text fontSize="11px" color="fg.subtle" flexShrink={0}>
          {item.timestamp}
        </Text>
      </Flex>

      {expanded && (
        <Box pb={3} px={1}>
          <ChangePreview changes={item.changes} />
        </Box>
      )}
    </Box>
  );
}

export function SyncHistory({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) return null;

  return (
    <Box>
      <Text fontSize="11px" color="fg.subtle" mb={2}>
        History
      </Text>
      <Flex direction="column">
        {items.map((item) => (
          <HistoryRow key={item.id} item={item} />
        ))}
      </Flex>
    </Box>
  );
}
