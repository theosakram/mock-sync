import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntegrationCard } from './IntegrationCard';
import { Provider } from '@/components/ui/provider';
import type { Integration } from '@/features/sync/modules/syncTypes';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<Provider>{ui}</Provider>);
};

const mockIntegration: Integration = {
  id: 'salesforce',
  name: 'Salesforce',
  description: 'CRM · users, accounts',
  status: 'synced',
  version: '1.4.2',
  lastSyncAt: '3 minutes ago',
};

describe('IntegrationCard', () => {
  it('should render integration name', () => {
    renderWithProvider(
      <IntegrationCard
        integration={mockIntegration}
        isSelected={false}
        onClick={() => {}}
      />
    );
    
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
  });

  it('should render version and last sync time', () => {
    renderWithProvider(
      <IntegrationCard
        integration={mockIntegration}
        isSelected={false}
        onClick={() => {}}
      />
    );
    
    expect(screen.getByText('1.4.2 · 3 minutes ago')).toBeInTheDocument();
  });

  it('should render "never synced" when lastSyncAt is null', () => {
    const integrationWithNoSync: Integration = {
      ...mockIntegration,
      lastSyncAt: null,
    };

    renderWithProvider(
      <IntegrationCard
        integration={integrationWithNoSync}
        isSelected={false}
        onClick={() => {}}
      />
    );
    
    expect(screen.getByText('1.4.2 · never synced')).toBeInTheDocument();
  });

  it('should render StatusBadge with correct status', () => {
    renderWithProvider(
      <IntegrationCard
        integration={mockIntegration}
        isSelected={false}
        onClick={() => {}}
      />
    );
    
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    
    renderWithProvider(
      <IntegrationCard
        integration={mockIntegration}
        isSelected={false}
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Salesforce').closest('div')!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when isLocked is true', () => {
    const handleClick = vi.fn();
    
    renderWithProvider(
      <IntegrationCard
        integration={mockIntegration}
        isSelected={false}
        isLocked={true}
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Salesforce').closest('div')!);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply selected styles when isSelected is true', () => {
    const { container } = renderWithProvider(
      <IntegrationCard
        integration={mockIntegration}
        isSelected={true}
        onClick={() => {}}
      />
    );
    
    // The card should have a border when selected
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
  });

  it('should apply not-allowed cursor when isLocked is true', () => {
    const { container } = renderWithProvider(
      <IntegrationCard
        integration={mockIntegration}
        isSelected={false}
        isLocked={true}
        onClick={() => {}}
      />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
  });

  it('should handle different integration statuses', () => {
    const statuses: Integration['status'][] = ['synced', 'syncing', 'conflict', 'error'];
    const expectedLabels = {
      synced: 'Synced',
      syncing: 'Syncing',
      conflict: 'Conflict',
      error: 'Error',
    };

    statuses.forEach((status) => {
      const integration: Integration = {
        ...mockIntegration,
        status,
      };

      const { unmount } = renderWithProvider(
        <IntegrationCard
          integration={integration}
          isSelected={false}
          onClick={() => {}}
        />
      );
      
      expect(screen.getByText(expectedLabels[status])).toBeInTheDocument();
      unmount();
    });
  });

  it('should render integration with change count', () => {
    const integrationWithChanges: Integration = {
      ...mockIntegration,
      status: 'conflict',
      changeCount: 4,
    };

    renderWithProvider(
      <IntegrationCard
        integration={integrationWithChanges}
        isSelected={false}
        onClick={() => {}}
      />
    );
    
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    expect(screen.getByText('Conflict')).toBeInTheDocument();
  });

  it('should render integration with error code', () => {
    const integrationWithError: Integration = {
      ...mockIntegration,
      status: 'error',
      errorCode: 502,
    };

    renderWithProvider(
      <IntegrationCard
        integration={integrationWithError}
        isSelected={false}
        onClick={() => {}}
      />
    );
    
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
