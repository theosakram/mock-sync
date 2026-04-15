import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  triggerSync,
  SyncApiError,
  getSyncErrorMessage,
} from './syncServices';
import { apiv1Url } from '@/utils/constants/urls';

const SYNC_ENDPOINT = `${apiv1Url}/data/sync`;

describe('SyncApiError', () => {
  it('should create error with status and message', () => {
    const error = new SyncApiError(404, 'Not found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('SyncApiError');
  });

  it('should be instance of Error', () => {
    const error = new SyncApiError(500, 'Server error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SyncApiError);
  });
});

describe('getSyncErrorMessage', () => {
  it('should return unexpected error message for non-SyncApiError', () => {
    const result = getSyncErrorMessage(new Error('Random error'));
    expect(result).toBe('Unexpected error. Please try again.');
  });

  it('should return unexpected error for null', () => {
    const result = getSyncErrorMessage(null);
    expect(result).toBe('Unexpected error. Please try again.');
  });

  it('should return unexpected error for undefined', () => {
    const result = getSyncErrorMessage(undefined);
    expect(result).toBe('Unexpected error. Please try again.');
  });

  it('should return unexpected error for string', () => {
    const result = getSyncErrorMessage('error string');
    expect(result).toBe('Unexpected error. Please try again.');
  });

  it('should return gateway error message for 502', () => {
    const error = new SyncApiError(502, 'Bad Gateway');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Gateway error. The integration client is unreachable.');
  });

  it('should return server error message for 500', () => {
    const error = new SyncApiError(500, 'Internal Server Error');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Internal server error. The sync service is unavailable.');
  });

  it('should return configuration error message for 400', () => {
    const error = new SyncApiError(400, 'Bad Request');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Configuration issue. Check your integration settings.');
  });

  it('should return configuration error message for 401', () => {
    const error = new SyncApiError(401, 'Unauthorized');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Configuration issue. Check your integration settings.');
  });

  it('should return configuration error message for 403', () => {
    const error = new SyncApiError(403, 'Forbidden');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Configuration issue. Check your integration settings.');
  });

  it('should return configuration error message for 404', () => {
    const error = new SyncApiError(404, 'Not Found');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Configuration issue. Check your integration settings.');
  });

  it('should return configuration error message for 499', () => {
    const error = new SyncApiError(499, 'Client Closed Request');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Configuration issue. Check your integration settings.');
  });

  it('should return generic message for other error codes', () => {
    const error = new SyncApiError(503, 'Service Unavailable');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Sync failed with status 503.');
  });

  it('should return generic message for 599', () => {
    const error = new SyncApiError(599, 'Network Connect Timeout');
    const result = getSyncErrorMessage(error);
    expect(result).toBe('Sync failed with status 599.');
  });
});

describe('triggerSync', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call fetch with correct URL for known integration', async () => {
    const mockResponse = {
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'salesforce',
          changes: [],
        },
        metadata: {},
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await triggerSync('salesforce');

    expect(fetch).toHaveBeenCalledWith(
      `${SYNC_ENDPOINT}?application_id=salesforce`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should use integrationId directly for unknown integrations', async () => {
    const mockResponse = {
      code: 'SUCCESS',
      message: 'Sync triggered',
      data: {
        sync_approval: {
          application_name: 'custom-integration',
          changes: [],
        },
        metadata: {},
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    await triggerSync('custom-integration');

    expect(fetch).toHaveBeenCalledWith(
      `${SYNC_ENDPOINT}?application_id=custom-integration`
    );
  });

  it('should map all known application IDs correctly', async () => {
    const knownIntegrations = ['salesforce', 'hubspot', 'stripe', 'slack'];
    
    for (const integration of knownIntegrations) {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          code: 'SUCCESS',
          message: 'Sync triggered',
          data: {
            sync_approval: {
              application_name: integration,
              changes: [],
            },
            metadata: {},
          },
        }),
      } as Response);

      await triggerSync(integration);

      expect(fetch).toHaveBeenLastCalledWith(
        `${SYNC_ENDPOINT}?application_id=${integration}`
      );
    }

    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('should throw SyncApiError when response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(triggerSync('salesforce')).rejects.toThrow(SyncApiError);
    await expect(triggerSync('salesforce')).rejects.toThrow('HTTP 500');
  });

  it('should throw SyncApiError with correct status code', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
    } as Response);

    try {
      await triggerSync('salesforce');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(SyncApiError);
      expect((error as SyncApiError).status).toBe(502);
    }
  });

  it('should throw SyncApiError for 404', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(triggerSync('unknown')).rejects.toThrow(SyncApiError);
    await expect(triggerSync('unknown')).rejects.toThrow('HTTP 404');
  });

  it('should return parsed JSON response', async () => {
    const mockResponse = {
      code: 'SUCCESS',
      message: 'Changes detected',
      data: {
        sync_approval: {
          application_name: 'hubspot',
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
        metadata: { version: '2.1.0' },
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await triggerSync('hubspot');

    expect(result.code).toBe('SUCCESS');
    expect(result.data.sync_approval.changes).toHaveLength(1);
    expect(result.data.sync_approval.changes[0].field_name).toBe('user.email');
  });

  it('should handle empty changes array', async () => {
    const mockResponse = {
      code: 'SUCCESS',
      message: 'No changes',
      data: {
        sync_approval: {
          application_name: 'stripe',
          changes: [],
        },
        metadata: {},
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await triggerSync('stripe');

    expect(result.data.sync_approval.changes).toEqual([]);
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Network error'));

    await expect(triggerSync('salesforce')).rejects.toThrow(TypeError);
    await expect(triggerSync('salesforce')).rejects.toThrow('Network error');
  });
});
