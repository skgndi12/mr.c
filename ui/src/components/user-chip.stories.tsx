import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';

import UserChip from '@/components/user-chip';

const meta = {
  title: 'Common/UserChip',
  component: UserChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nickname: '신비로운 평론가 붉은 여우',
    tag: '#MQ3B',
  },

  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-10">
        <div className="fixed inset-0 bg-emerald-100 text-center hover:bg-emerald-200">outside</div>
        <Story />
      </div>
    ),
  ],

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByTestId('user-chip');
    let more: HTMLElement;
    let outside: HTMLElement;

    await expect(element).toBeInTheDocument();

    await step('should open dropdown on click element', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await userEvent.click(element);
      more = canvas.getByText('작성글 보기');
      await expect(more).toBeInTheDocument();
    });

    await step('shoulc close dropdown on click outside', async () => {
      outside = canvas.getByText('outside');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await userEvent.click(outside);
      await expect(more).not.toBeInTheDocument();
    });
  },
};
