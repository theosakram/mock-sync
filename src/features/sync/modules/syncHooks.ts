import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { triggerSync, SyncApiError, getSyncErrorMessage } from "./syncServices";
import {
  SyncFlowState,
  Change,
  ConflictResolutions,
  SyncResponse,
} from "./syncTypes";

interface SyncFlowResult {
  state: SyncFlowState;
  changes: Change[];
  resolutions: ConflictResolutions;
  errorMessage: string | null;
  syncData: SyncResponse | null;
  sync: () => void;
  isSyncing: boolean;
  resolveChange: (changeId: string, choice: "local" | "remote") => void;
  applyMerge: () => void;
  reset: () => void;
}

export function useSyncFlow(integrationId: string): SyncFlowResult {
  const [state, setState] = useState<SyncFlowState>("idle");
  const [changes, setChanges] = useState<Change[]>([]);
  const [resolutions, setResolutions] = useState<ConflictResolutions>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncData, setSyncData] = useState<SyncResponse | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => triggerSync(integrationId),
    onMutate: () => {
      setState("syncing");
      setErrorMessage(null);
    },
    onSuccess: (data) => {
      setSyncData(data);
      const incoming = data.data.sync_approval.changes;
      setChanges(incoming);

      const conflicts = incoming.filter((c) => c.change_type === "UPDATE");
      if (conflicts.length > 0) {
        const defaults: ConflictResolutions = {};
        conflicts.forEach((c) => {
          defaults[c.id] = "remote";
        });
        setResolutions(defaults);
        setState("conflict");
      } else {
        setState("preview");
      }
    },
    onError: (error: unknown) => {
      setState("error");
      setErrorMessage(
        error instanceof SyncApiError
          ? getSyncErrorMessage(error)
          : "An unexpected error occurred.",
      );
    },
  });

  const resolveChange = useCallback(
    (changeId: string, choice: "local" | "remote") => {
      setResolutions((prev) => ({ ...prev, [changeId]: choice }));
    },
    [],
  );

  const applyMerge = useCallback(() => {
    setState("resolved");
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setChanges([]);
    setResolutions({});
    setErrorMessage(null);
    setSyncData(null);
  }, []);

  return {
    state,
    changes,
    resolutions,
    errorMessage,
    syncData,
    sync: () => mutate(),
    isSyncing: isPending,
    resolveChange,
    applyMerge,
    reset,
  };
}
