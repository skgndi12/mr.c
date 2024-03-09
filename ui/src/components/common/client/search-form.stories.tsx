import type { Meta, StoryObj } from '@storybook/react';

import SearchForm from '@/components/common/client/search-form';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Common/SearchForm',
  component: SearchForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex w-full justify-center px-2 py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { filters: ['foo', 'bar', 'baz'] },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: 'pathname',
        query: {
          foo: 'hello',
        },
        push(...args: string[]) {
          alert(`router pushes to: ${args[0]}`);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          action('nextNavigation.push')(...args);

          return Promise.resolve(true);
        },
      },
    },
  },
};
