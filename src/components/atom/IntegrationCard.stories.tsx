import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { IntegrationCard } from './IntegrationCard';
import { Integration } from '@/features/sync/modules/syncTypes';

const meta: Meta<typeof IntegrationCard> = {
  title: 'Components/IntegrationCard',
  component: IntegrationCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the card is currently selected',
    },
    isLocked: {
      control: 'boolean',
      description: 'Whether the card is disabled/locked',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when card is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockIntegration: Integration = {
  id: 'salesforce',
  name: 'Salesforce',
  description: 'CRM · users, accounts',
  status: 'synced',
  version: '1.4.2',
  lastSyncAt: '3 minutes ago',
};

export const Default: Story = {
  args: {
    integration: mockIntegration,
    isSelected: false,
    isLocked: false,
    onClick: () => {},
  },
};

export const Selected: Story = {
  args: {
    integration: mockIntegration,
    isSelected: true,
    isLocked: false,
    onClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Selected state with visual emphasis.',
      },
    },
  },
};

export const Locked: Story = {
  args: {
    integration: mockIntegration,
    isSelected: false,
    isLocked: true,
    onClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Locked/disabled state prevents interaction.',
      },
    },
  },
};

export const WithConflict: Story = {
  args: {
    integration: {
      ...mockIntegration,
      status: 'conflict',
      changeCount: 4,
    },
    isSelected: false,
    isLocked: false,
    onClick: () => {},
  },
};

export const WithError: Story = {
  args: {
    integration: {
      ...mockIntegration,
      status: 'error',
      errorCode: 502,
    },
    isSelected: false,
    isLocked: false,
    onClick: () => {},
  },
};

export const Syncing: Story = {
  args: {
    integration: {
      ...mockIntegration,
      status: 'syncing',
    },
    isSelected: false,
    isLocked: false,
    onClick: () => {},
  },
};

export const NeverSynced: Story = {
  args: {
    integration: {
      ...mockIntegration,
      lastSyncAt: null,
    },
    isSelected: false,
    isLocked: false,
    onClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows "never synced" when lastSyncAt is null.',
      },
    },
  },
};

export const IntegrationList: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '280px' }}>
      <IntegrationCard
        integration={{
          id: 'salesforce',
          name: 'Salesforce',
          description: 'CRM · users, accounts',
          status: 'conflict',
          version: '1.4.2',
          lastSyncAt: '3 minutes ago',
          changeCount: 4,
        }}
        isSelected={true}
        onClick={() => {}}
      />
      <IntegrationCard
        integration={{
          id: 'hubspot',
          name: 'HubSpot',
          description: 'CRM · contacts, deals',
          status: 'synced',
          version: '2.1.0',
          lastSyncAt: '12 minutes ago',
        }}
        isSelected={false}
        onClick={() => {}}
      />
      <IntegrationCard
        integration={{
          id: 'stripe',
          name: 'Stripe',
          description: 'Payments · subscriptions',
          status: 'syncing',
          version: '3.0.1',
          lastSyncAt: '1 minute ago',
        }}
        isSelected={false}
        onClick={() => {}}
      />
      <IntegrationCard
        integration={{
          id: 'slack',
          name: 'Slack',
          description: 'Comms · users',
          status: 'error',
          version: '1.2.0',
          lastSyncAt: '20 minutes ago',
          errorCode: 502,
        }}
        isSelected={false}
        onClick={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full integration list showing all possible states together.',
      },
    },
  },
};
