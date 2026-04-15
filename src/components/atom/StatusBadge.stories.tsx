import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusBadge } from './StatusBadge';
import { IntegrationStatus } from '@/features/sync/modules/syncTypes';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['synced', 'syncing', 'conflict', 'error'] as IntegrationStatus[],
      description: 'The integration status to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Synced: Story = {
  args: {
    status: 'synced',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displayed when the integration is fully synced and up to date.',
      },
    },
  },
};

export const Syncing: Story = {
  args: {
    status: 'syncing',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displayed while a sync operation is in progress.',
      },
    },
  },
};

export const Conflict: Story = {
  args: {
    status: 'conflict',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displayed when there are conflicts that need manual resolution.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displayed when the last sync operation failed.',
      },
    },
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <StatusBadge status="synced" />
      <StatusBadge status="syncing" />
      <StatusBadge status="conflict" />
      <StatusBadge status="error" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible status variants displayed together for comparison.',
      },
    },
  },
};
