import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { Provider } from '@/components/ui/provider';
import type { IntegrationStatus } from '@/features/sync/modules/syncTypes';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<Provider>{ui}</Provider>);
};

describe('StatusBadge', () => {
  it('should render "Synced" with green color for synced status', () => {
    renderWithProvider(<StatusBadge status="synced" />);
    
    const badge = screen.getByText('Synced');
    expect(badge).toBeInTheDocument();
  });

  it('should render "Syncing" with blue color for syncing status', () => {
    renderWithProvider(<StatusBadge status="syncing" />);
    
    const badge = screen.getByText('Syncing');
    expect(badge).toBeInTheDocument();
  });

  it('should render "Conflict" with orange color for conflict status', () => {
    renderWithProvider(<StatusBadge status="conflict" />);
    
    const badge = screen.getByText('Conflict');
    expect(badge).toBeInTheDocument();
  });

  it('should render "Error" with red color for error status', () => {
    renderWithProvider(<StatusBadge status="error" />);
    
    const badge = screen.getByText('Error');
    expect(badge).toBeInTheDocument();
  });

  it('should handle all IntegrationStatus types', () => {
    const statuses: IntegrationStatus[] = ['synced', 'syncing', 'conflict', 'error'];
    const expectedLabels: Record<IntegrationStatus, string> = {
      synced: 'Synced',
      syncing: 'Syncing',
      conflict: 'Conflict',
      error: 'Error',
    };

    statuses.forEach((status) => {
      const { unmount } = renderWithProvider(<StatusBadge status={status} />);
      expect(screen.getByText(expectedLabels[status])).toBeInTheDocument();
      unmount();
    });
  });
});
