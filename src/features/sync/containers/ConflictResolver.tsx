import { Box, Flex, Text, Button, Grid, GridItem } from "@chakra-ui/react";
import { Change, ConflictResolutions } from "../modules/syncTypes";

interface ConflictResolverProps {
  changes: Change[];
  resolutions: ConflictResolutions;
  onResolve: (changeId: string, choice: "local" | "remote") => void;
  onApplyMerge: () => void;
}

function ConflictSide({
  label,
  value,
  isSelected,
  onClick,
}: {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      p={3}
      cursor="pointer"
      onClick={onClick}
      borderLeft={isSelected ? "2px solid" : "2px solid transparent"}
      borderColor={isSelected ? "blue.500" : "transparent"}
      bg={isSelected ? "blue.subtle" : "transparent"}
      transition="all 0.15s"
      _hover={{ bg: isSelected ? "blue.subtle" : "bg.subtle" }}
    >
      <Text fontSize="10px" color="fg.subtle" mb={1}>
        {label}
      </Text>
      <Text fontSize="12px" fontFamily="mono" color="fg" wordBreak="break-all">
        {value}
      </Text>
    </Box>
  );
}

export function ConflictResolver({
  changes,
  resolutions,
  onResolve,
  onApplyMerge,
}: ConflictResolverProps) {
  const conflicts = changes.filter((c) => c.change_type === "UPDATE");
  const allResolved = conflicts.every((c) => resolutions[c.id] !== undefined);

  if (conflicts.length === 0) return null;

  return (
    <Box>
      <Text fontSize="11px" color="fg.subtle" mb={2}>
        {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} — pick a
        value for each
      </Text>

      <Flex direction="column" gap={2} mb={4}>
        {conflicts.map((change) => (
          <Box
            key={change.id}
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="md"
            overflow="hidden"
          >
            <Box
              px={3}
              py={2}
              borderBottom="1px solid"
              borderColor="border.subtle"
            >
              <Text fontSize="11px" fontFamily="mono" color="fg.muted">
                {change.field_name}
              </Text>
            </Box>
            <Grid templateColumns="1fr 1fr">
              <GridItem borderRight="1px solid" borderColor="border.subtle">
                <ConflictSide
                  label="Local"
                  value={change.current_value}
                  isSelected={resolutions[change.id] === "local"}
                  onClick={() => onResolve(change.id, "local")}
                />
              </GridItem>
              <GridItem>
                <ConflictSide
                  label="Incoming"
                  value={change.new_value}
                  isSelected={resolutions[change.id] === "remote"}
                  onClick={() => onResolve(change.id, "remote")}
                />
              </GridItem>
            </Grid>
          </Box>
        ))}
      </Flex>

      <Button
        w="full"
        size="sm"
        variant="outline"
        disabled={!allResolved}
        onClick={onApplyMerge}
      >
        Apply merge
      </Button>
    </Box>
  );
}
