import { Change } from "@/features/sync/modules/syncTypes";
import { Flex, Text } from "@chakra-ui/react";

function ChangeRow({ change }: { change: Change }) {
  const isCreate = change.change_type === "CREATE";
  const isDelete = change.change_type === "DELETE";

  return (
    <Flex
      px={3}
      py={2}
      borderRadius="md"
      border="1px solid"
      borderColor="border.subtle"
      align="center"
      gap={3}
    >
      <Text
        fontSize="11px"
        fontFamily="mono"
        color="fg.muted"
        flex={1}
        minW={0}
        truncate
      >
        {change.field_name}
      </Text>

      {!isCreate && (
        <Text
          fontSize="11px"
          fontFamily="mono"
          color={isDelete ? "fg.error" : "fg.subtle"}
          textDecoration={isDelete ? "line-through" : "none"}
          maxW="120px"
          truncate
        >
          {change.current_value || "—"}
        </Text>
      )}

      {!isDelete && !isCreate && (
        <Text fontSize="11px" color="fg.subtle">
          →
        </Text>
      )}

      {!isDelete && (
        <Text
          fontSize="11px"
          fontFamily="mono"
          color={isCreate ? "fg.success" : "fg"}
          maxW="120px"
          truncate
        >
          {change.new_value || "—"}
        </Text>
      )}
    </Flex>
  );
}

export function ChangePreview({ changes }: { changes: Change[] }) {
  if (changes.length === 0) return null;

  return (
    <Flex direction="column" gap={1}>
      {changes.map((change) => (
        <ChangeRow key={change.id} change={change} />
      ))}
    </Flex>
  );
}
