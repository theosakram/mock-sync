import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ConflictResolver } from './ConflictResolver';
import { Change } from '@/features/sync/modules/syncTypes';

const meta: Meta<typeof ConflictResolver> = {
  title: 'Features/ConflictResolver',
  component: ConflictResolver,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onResolve: {
      action: 'resolved',
      description: 'Called when a conflict side is selected',
    },
    onApplyMerge: {
      action: 'applied',
      description: 'Called when merge is applied',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockConflicts: Change[] = [
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
];

export const Unresolved: Story = {
  args: {
    changes: mockConflicts,
    resolutions: {},
    onResolve: () => {},
    onApplyMerge: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Initial state with no resolutions selected. Apply button is disabled.',
      },
    },
  },
};

export const PartiallyResolved: Story = {
  args: {
    changes: mockConflicts,
    resolutions: { c1: 'local' },
    onResolve: () => {},
    onApplyMerge: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'One conflict resolved, one pending. Apply button still disabled.',
      },
    },
  },
};

export const FullyResolved: Story = {
  args: {
    changes: mockConflicts,
    resolutions: { c1: 'local', c2: 'remote' },
    onResolve: () => {},
    onApplyMerge: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'All conflicts resolved. Apply button is enabled.',
      },
    },
  },
};

export const SingleConflict: Story = {
  args: {
    changes: [mockConflicts[0]],
    resolutions: { c1: 'remote' },
    onResolve: () => {},
    onApplyMerge: () => {},
  },
};

export const ManyConflicts: Story = {
  args: {
    changes: [
      ...mockConflicts,
      {
        id: 'c3',
        field_name: 'user.name',
        change_type: 'UPDATE',
        current_value: 'Alice Smith',
        new_value: 'Alice Johnson',
      },
      {
        id: 'c4',
        field_name: 'user.phone',
        change_type: 'UPDATE',
        current_value: '+1-555-0100',
        new_value: '+1-555-0199',
      },
    ],
    resolutions: { c1: 'local', c2: 'remote', c3: 'local', c4: 'remote' },
    onResolve: () => {},
    onApplyMerge: () => {},
  },
};

export const MixedWithNonConflicts: Story = {
  args: {
    changes: [
      ...mockConflicts,
      {
        id: 'c3',
        field_name: 'key.status',
        change_type: 'CREATE',
        current_value: '',
        new_value: 'active',
      },
      {
        id: 'c4',
        field_name: 'temp.data',
        change_type: 'DELETE',
        current_value: 'old data',
        new_value: '',
      },
    ],
    resolutions: { c1: 'local', c2: 'remote' },
    onResolve: () => {},
    onApplyMerge: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Only UPDATE changes are shown in conflict resolver. CREATE and DELETE are filtered out.',
      },
    },
  },
};
