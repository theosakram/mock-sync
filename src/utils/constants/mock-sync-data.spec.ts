import { describe, it, expect } from 'vitest';
import { MOCK_INTEGRATIONS, MOCK_HISTORY } from './mock-sync-data';
import type { Integration, HistoryItem } from '@/features/sync/modules/syncTypes';

describe('MOCK_INTEGRATIONS', () => {
  it('should be an array', () => {
    expect(Array.isArray(MOCK_INTEGRATIONS)).toBe(true);
  });

  it('should have 4 integrations', () => {
    expect(MOCK_INTEGRATIONS).toHaveLength(4);
  });

  it('should contain all required integration fields', () => {
    MOCK_INTEGRATIONS.forEach((integration: Integration) => {
      expect(integration).toHaveProperty('id');
      expect(integration).toHaveProperty('name');
      expect(integration).toHaveProperty('description');
      expect(integration).toHaveProperty('status');
      expect(integration).toHaveProperty('version');
      expect(integration).toHaveProperty('lastSyncAt');
      expect(typeof integration.id).toBe('string');
      expect(typeof integration.name).toBe('string');
      expect(typeof integration.description).toBe('string');
      expect(typeof integration.version).toBe('string');
    });
  });

  it('should have valid status values', () => {
    const validStatuses = ['synced', 'syncing', 'conflict', 'error'];
    MOCK_INTEGRATIONS.forEach((integration: Integration) => {
      expect(validStatuses).toContain(integration.status);
    });
  });

  it('should have unique ids', () => {
    const ids = MOCK_INTEGRATIONS.map((i: Integration) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have expected integration ids', () => {
    const ids = MOCK_INTEGRATIONS.map((i: Integration) => i.id);
    expect(ids).toContain('salesforce');
    expect(ids).toContain('hubspot');
    expect(ids).toContain('stripe');
    expect(ids).toContain('slack');
  });

  it('should have correct names matching ids', () => {
    const idToName: Record<string, string> = {
      salesforce: 'Salesforce',
      hubspot: 'HubSpot',
      stripe: 'Stripe',
      slack: 'Slack',
    };

    MOCK_INTEGRATIONS.forEach((integration: Integration) => {
      expect(integration.name).toBe(idToName[integration.id]);
    });
  });

  it('should have conflict status for salesforce with changeCount', () => {
    const salesforce = MOCK_INTEGRATIONS.find((i: Integration) => i.id === 'salesforce');
    expect(salesforce?.status).toBe('conflict');
    expect(salesforce?.changeCount).toBe(4);
  });

  it('should have error status for slack with errorCode', () => {
    const slack = MOCK_INTEGRATIONS.find((i: Integration) => i.id === 'slack');
    expect(slack?.status).toBe('error');
    expect(slack?.errorCode).toBe(502);
  });

  it('should have syncing status for stripe', () => {
    const stripe = MOCK_INTEGRATIONS.find((i: Integration) => i.id === 'stripe');
    expect(stripe?.status).toBe('syncing');
  });

  it('should have synced status for hubspot', () => {
    const hubspot = MOCK_INTEGRATIONS.find((i: Integration) => i.id === 'hubspot');
    expect(hubspot?.status).toBe('synced');
  });

  it('should have semver versions', () => {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    MOCK_INTEGRATIONS.forEach((integration: Integration) => {
      expect(integration.version).toMatch(semverRegex);
    });
  });
});

describe('MOCK_HISTORY', () => {
  it('should be an array', () => {
    expect(Array.isArray(MOCK_HISTORY)).toBe(true);
  });

  it('should have 3 history items', () => {
    expect(MOCK_HISTORY).toHaveLength(3);
  });

  it('should contain all required history fields', () => {
    MOCK_HISTORY.forEach((item: HistoryItem) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('message');
      expect(item).toHaveProperty('timestamp');
      expect(item).toHaveProperty('version');
      expect(item).toHaveProperty('changes');
      expect(typeof item.id).toBe('string');
      expect(typeof item.message).toBe('string');
      expect(typeof item.timestamp).toBe('string');
      expect(typeof item.version).toBe('string');
      expect(Array.isArray(item.changes)).toBe(true);
    });
  });

  it('should have valid type values', () => {
    const validTypes = ['success', 'conflict', 'error'];
    MOCK_HISTORY.forEach((item: HistoryItem) => {
      expect(validTypes).toContain(item.type);
    });
  });

  it('should have unique ids', () => {
    const ids = MOCK_HISTORY.map((i: HistoryItem) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have changes with valid change types', () => {
    const validChangeTypes = ['UPDATE', 'CREATE', 'DELETE'];
    MOCK_HISTORY.forEach((item: HistoryItem) => {
      item.changes.forEach((change) => {
        expect(validChangeTypes).toContain(change.change_type);
        expect(change).toHaveProperty('id');
        expect(change).toHaveProperty('field_name');
        expect(change).toHaveProperty('change_type');
        expect(change).toHaveProperty('current_value');
        expect(change).toHaveProperty('new_value');
      });
    });
  });

  it('should have first item with conflict type', () => {
    expect(MOCK_HISTORY[0].type).toBe('conflict');
  });

  it('should have second and third items with success type', () => {
    expect(MOCK_HISTORY[1].type).toBe('success');
    expect(MOCK_HISTORY[2].type).toBe('success');
  });
});
