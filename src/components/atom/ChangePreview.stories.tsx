import type { Meta, StoryObj } from '@storybook/react';
import { ChangePreview } from './ChangePreview';
import { Change } from '@/features/sync/modules/syncTypes';

const meta: Meta<typeof ChangePreview> = {
  title: 'Components/ChangePreview',
  component: ChangePreview,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockChanges: Change[] = [
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
    current_value: 'old value',
    new_value: '',
  },
];

export const UpdateChanges: Story = {
  args: {
    changes: mockChanges.filter(c => c.change_type === 'UPDATE'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows UPDATE changes with before and after values.',
      },
    },
  },
};

export const CreateChanges: Story = {
  args: {
    changes: [mockChanges[2]],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows CREATE changes - new values without old values.',
      },
    },
  },
};

export const DeleteChanges: Story = {
  args: {
    changes: [mockChanges[3]],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows DELETE changes - old values with strikethrough.',
      },
    },
  },
};

export const MixedChanges: Story = {
  args: {
    changes: mockChanges,
  },
  parameters: {
    docs: {
      description: {
        story: 'All change types displayed together.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    changes: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state renders nothing.',
      },
    },
  },
};

export const LongValues: Story = {
  args: {
    changes: [
      {
        id: 'c5',
        field_name: 'user.very.long.field.name.that.might.overflow',
        change_type: 'UPDATE',
        current_value: 'this-is-a-very-long-value-that-should-be-truncated',
        new_value: 'another-very-long-value-for-testing-truncation',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Long field names and values are truncated gracefully.',
      },
    },
  },
};
