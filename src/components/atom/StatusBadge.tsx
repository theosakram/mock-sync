import { IntegrationStatus } from "@/features/sync/modules/syncTypes";
import { Badge } from "@chakra-ui/react";

const statusConfig: Record<
  IntegrationStatus,
  { label: string; colorPalette: string }
> = {
  synced: { label: "Synced", colorPalette: "green" },
  syncing: { label: "Syncing", colorPalette: "blue" },
  conflict: { label: "Conflict", colorPalette: "orange" },
  error: { label: "Error", colorPalette: "red" },
};

interface StatusBadgeProps {
  status: IntegrationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, colorPalette } = statusConfig[status];
  return (
    <Badge colorPalette={colorPalette} variant="subtle" size="sm">
      {label}
    </Badge>
  );
}
