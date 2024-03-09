import type { Meta, StoryObj } from '@storybook/react';
import Time from '@/components/common/server/time';

const meta = {
  title: 'Common/Time',
  component: Time,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    locale: { options: ['en-US', 'ko-KR'], control: { type: 'radio' } },
  },
  render: (args) => <Time {...args} />,
  tags: ['autodocs'],
} satisfies Meta<typeof Time>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dateStr: new Date().toISOString(),
    locale: 'ko-KR',
    relative: false,
  },
};

export const Relative: Story = {
  args: {
    dateStr: new Date(new Date().getTime() - 1000 * 60 * 30).toISOString(),
    relative: true,
  },
};
