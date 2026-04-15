import { describe, it, expect } from 'vitest';
import { apiv1Url } from './urls';

describe('URLs', () => {
  it('should export correct API v1 URL', () => {
    expect(apiv1Url).toBe('https://portier-takehometest.onrender.com/api/v1');
  });

  it('should be a valid HTTPS URL', () => {
    expect(apiv1Url).toMatch(/^https:\/\//);
  });

  it('should contain the domain', () => {
    expect(apiv1Url).toContain('portier-takehometest.onrender.com');
  });

  it('should end with /api/v1', () => {
    expect(apiv1Url).toMatch(/\/api\/v1$/);
  });
});
