import type { Preview } from '@storybook/nextjs-vite'
import { Provider } from '../src/components/ui/provider'
import React from 'react'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a202c' },
      ],
    },
  },
  decorators: [
    (Story) => React.createElement(Provider, { children: React.createElement(Story) }),
  ],
};

export default preview;