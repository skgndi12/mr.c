import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';

import UserChip from '@/components/auth/client/user-chip';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Auth/UserChip',
  component: UserChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        push(...args: string[]) {
          alert(`router pushes to: ${args[0]}`);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          action('nextNavigation.push')(...args);

          return Promise.resolve(true);
        },
      },
    },
  },

  args: {
    nickname: '신비로운 평론가 붉은 여우',
    tag: '#MQ3B',
  },

  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-14">
        <div className="fixed inset-0 bg-emerald-100 text-center hover:bg-emerald-200">outside</div>
        <Story />
      </div>
    ),
  ],

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByTestId('user-chip');
    let moreReview: HTMLElement;
    let moreComment: HTMLElement;
    let outside: HTMLElement;

    await expect(element).toBeInTheDocument();

    await step('should open dropdown on click element', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await userEvent.click(element);

      moreReview = canvas.getByText('작성 리뷰');
      await expect(moreReview).toBeInTheDocument();

      moreComment = canvas.getByText('작성 코멘트');
      await expect(moreComment).toBeInTheDocument();
    });

    // TODO: test actions programatically - 현재 storybook의 first class 지원은 없음
    // https://stackoverflow.com/questions/77240899/how-can-i-assert-that-a-storybook-action-was-fired

    await step('should close dropdown on click outside', async () => {
      outside = canvas.getByText('outside');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await userEvent.click(outside);

      await expect(moreReview).not.toBeInTheDocument();
      await expect(moreComment).not.toBeInTheDocument();
    });
  },
};
