import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';

import Editor from '@/components/editor';

const meta = {
  title: 'Review/Editor',
  component: Editor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},

  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByTestId('content-editable');

    await expect(element).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await userEvent.click(element);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await userEvent.type(element, 'hello world');
  },
};
