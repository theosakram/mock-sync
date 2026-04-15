import type { Meta, StoryObj } from '@storybook/react';
import { SyncHistory } from './SyncHistory';
import { HistoryItem } from '@/features/sync/modules/syncTypes';

const meta: Meta<typeof SyncHistory> = {
  title: 'Features/SyncHistory',
  component: SyncHistory,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockHistory: HistoryItem[] = [
  {
    id: 'h1',
    type: 'conflict',
    message: 'Sync paused — 2 conflicts detected',
    timestamp: 'Today, 14:22',
    version: 'v1.4.2',
    changes: [
      {
        id: 'c1',
        field_name: 'user.email',
        change_type: 'UPDATE',
        current_value: 'alice@old.com',
        new_value: 'alice@company.com',
      },
      {
        id: 'c2',
        field_name: 'user.role',
        change_type: 'UPDATE',
        current_value: 'guest',
        new_value: 'admin',
      },
    ],
  },
  {
    id: 'h2',
    type: 'success',
    message: 'Synced 3 fields successfully · v1.4.1 → v1.4.2',
    timestamp: 'Today, 14:10',
    version: 'v1.4.1',
    changes: [
      {
        id: 'c3',
        field_name: 'user.name',
        change_type: 'UPDATE',
        current_value: 'Alice T.',
        new_value: 'Alice Tan',
      },
    ],
  },
  {
    id: 'h3',
    type: 'success',
    message: 'Full sync completed · 4 records updated',
    timestamp: 'Yesterday, 09:44',
    version: 'v1.4.0',
    changes: [],
  },
  {
    id: 'h4',
    type: 'error',
    message: 'Sync failed — Connection timeout',
    timestamp: 'Yesterday, 08:30',
    version: 'v1.3.9',
    changes: [],
  },
];

export const Default: Story = {
  args: {
    items: mockHistory,
  },
};

export const SuccessOnly: Story = {
  args: {
    items: mockHistory.filter(item => item.type === 'success'),
  },
  parameters: {
    docs: {
      description: {
        story: 'History showing only successful syncs.',
      },
    },
  },
};

export const WithConflicts: Story = {
  args: {
    items: mockHistory.filter(item => item.type === 'conflict'),
  },
  parameters: {
    docs: {
      description: {
        story: 'History showing conflict events.',
      },
    },
  },
};

export const WithErrors: Story = {
  args: {
    items: mockHistory.filter(item => item.type === 'error'),
  },
  parameters: {
    docs: {
      description: {
        story: 'History showing error events.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state renders nothing.',
      },
    },
  },
};

export const SingleItem: Story = {
  args: {
    items: [mockHistory[0]],
  },
};
