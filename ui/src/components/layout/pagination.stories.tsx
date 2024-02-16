import type { Meta, StoryObj } from '@storybook/react';

import Pagination from '@/components/layout/pagination';

const meta = {
  title: 'Layout/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    totalPages: 26,
  },
  argTypes: { totalPages: { control: false } },
  decorators: [
    (Story) => (
      <div className="flex w-full justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          page: 13,
        },
      },
    },
  },
};

export const First3: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          page: 1,
        },
      },
    },
  },
};

export const Among4to6: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          page: 5,
        },
      },
    },
  },
};

export const Among4to6FromTheLast: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          page: 21,
        },
      },
    },
  },
};

export const Last3: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          page: 26,
        },
      },
    },
  },
};

export const TotalLessOrEqual10: Story = {
  args: {
    totalPages: 10,
  },

  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {
          page: 5,
        },
      },
    },
  },
};
