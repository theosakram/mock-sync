import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSyncFlow } from './syncHooks';
import * as syncServices from './syncServices';
import type { ReactNode } from 'react';

// Mock the syncServices module
vi.mock('./syncServices', () => ({
  triggerSync: vi.fn(),
  SyncApiError: class SyncApiError extends Error {
    constructor(public readonly status: number, message: string) {
      super(message);
      this.name = 'SyncApiError';
    }
  },
  getSyncErrorMessage: vi.fn((error) => {
    if (!(error instanceof Error && 'status' in error)) {
      return 'Unexpected error. Please try again.';
    }
    const status = (error as { status: number }).status;
    if (status === 502) return 'Gateway error. The integration client is unreachable.';
    if (status === 500) return 'Internal server error. The sync service is unavailable.';
    if (status >= 400 && status < 500) return 'Configuration issue. Check your integration settings.';
    return `Sync failed with status ${status}.`;
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

describe('useSyncFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.changes).toEqual([]);
    expect(result.current.resolutions).toEqual({});
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.syncData).toBeNull();
  });

  it('should transition to syncing state when sync is called', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    expect(result.current.state).toBe('syncing');
    expect(result.current.isSyncing).toBe(true);
    expect(result.current.errorMessage).toBeNull();

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false);
    });
  });

  it('should transition to preview state when no conflicts', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'CREATE',
              current_value: '',
              new_value: 'new@example.com',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('preview');
    });

    expect(result.current.changes).toHaveLength(1);
    expect(result.current.changes[0].change_type).toBe('CREATE');
  });

  it('should transition to conflict state when conflicts exist', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'UPDATE',
              current_value: 'old@example.com',
              new_value: 'new@example.com',
            },
            {
              id: 'c2',
              field_name: 'user.name',
              change_type: 'UPDATE',
              current_value: 'Old Name',
              new_value: 'New Name',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('conflict');
    });

    expect(result.current.changes).toHaveLength(2);
    expect(result.current.resolutions).toEqual({
      c1: 'remote',
      c2: 'remote',
    });
  });

  it('should handle error state', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    const error = new syncServices.SyncApiError(500, 'Server Error');
    mockTriggerSync.mockRejectedValue(error);

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('error');
    });

    expect(result.current.errorMessage).toBe('Internal server error. The sync service is unavailable.');
    expect(result.current.isSyncing).toBe(false);
  });

  it('should handle 502 error', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    const error = new syncServices.SyncApiError(502, 'Bad Gateway');
    mockTriggerSync.mockRejectedValue(error);

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('error');
    });

    expect(result.current.errorMessage).toBe('Gateway error. The integration client is unreachable.');
  });

  it('should handle unexpected errors', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('error');
    });

    expect(result.current.errorMessage).toBe('An unexpected error occurred.');
  });

  it('should update resolution for a change', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'UPDATE',
              current_value: 'old@example.com',
              new_value: 'new@example.com',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('conflict');
    });

    act(() => {
      result.current.resolveChange('c1', 'local');
    });

    expect(result.current.resolutions).toEqual({
      c1: 'local',
    });
  });

  it('should handle multiple resolution updates', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'UPDATE',
              current_value: 'old@example.com',
              new_value: 'new@example.com',
            },
            {
              id: 'c2',
              field_name: 'user.name',
              change_type: 'UPDATE',
              current_value: 'Old',
              new_value: 'New',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('conflict');
    });

    act(() => {
      result.current.resolveChange('c1', 'local');
      result.current.resolveChange('c2', 'local');
    });

    expect(result.current.resolutions).toEqual({
      c1: 'local',
      c2: 'local',
    });
  });

  it('should transition to resolved state on applyPreview', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'CREATE',
              current_value: '',
              new_value: 'new@example.com',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('preview');
    });

    act(() => {
      result.current.applyPreview();
    });

    expect(result.current.state).toBe('resolved');
  });

  it('should transition to resolved state on applyMerge', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'UPDATE',
              current_value: 'old@example.com',
              new_value: 'new@example.com',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('conflict');
    });

    act(() => {
      result.current.applyMerge();
    });

    expect(result.current.state).toBe('resolved');
  });

  it('should reset to initial state', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'UPDATE',
              current_value: 'old@example.com',
              new_value: 'new@example.com',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('conflict');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.changes).toEqual([]);
    expect(result.current.resolutions).toEqual({});
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.syncData).toBeNull();
  });

  it('should handle DELETE change type without conflict', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.status',
              change_type: 'DELETE',
              current_value: 'active',
              new_value: '',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('preview');
    });

    expect(result.current.changes[0].change_type).toBe('DELETE');
  });

  it('should handle mixed change types with only UPDATE causing conflict', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [
            {
              id: 'c1',
              field_name: 'user.email',
              change_type: 'CREATE',
              current_value: '',
              new_value: 'new@example.com',
            },
            {
              id: 'c2',
              field_name: 'user.status',
              change_type: 'UPDATE',
              current_value: 'active',
              new_value: 'inactive',
            },
            {
              id: 'c3',
              field_name: 'user.temp',
              change_type: 'DELETE',
              current_value: 'value',
              new_value: '',
            },
          ],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('conflict');
    });

    expect(result.current.changes).toHaveLength(3);
    expect(result.current.resolutions).toHaveProperty('c2');
    expect(result.current.resolutions.c2).toBe('remote');
  });

  it('should store syncData in state', async () => {
    const mockResponse = {
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [],
        },
        metadata: { version: '1.0.0' },
      },
    };

    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.syncData).not.toBeNull();
    });

    expect(result.current.syncData).toEqual(mockResponse);
  });

  it('should handle empty changes array going to preview state', async () => {
    const mockTriggerSync = vi.mocked(syncServices.triggerSync);
    mockTriggerSync.mockResolvedValue({
      code: 'SUCCESS',
      message: 'No changes',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [],
        },
        metadata: {},
      },
    });

    const { result } = renderHook(() => useSyncFlow('salesforce'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.sync();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('preview');
    });

    expect(result.current.changes).toEqual([]);
  });
});
