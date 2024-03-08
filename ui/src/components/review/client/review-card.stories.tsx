import type { Meta, StoryObj } from '@storybook/react';

import { ReviewCard } from '@/components/review/client/review-card';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Review/ReviewCard',
  component: ReviewCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="container flex max-w-5xl justify-center p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    review: {
      id: 1,
      userId: '7289ae9c-42b1-49ca-8f5b-a1831583e903',
      nickname: '신비로운 평론가 붉은 여우',
      tag: '#MQ3B',
      title: '매드맥스 리뷰~',
      movieName: 'Mad Max',
      content:
        '{"description":"\\"매드맥스\\"는 조지 밀러 감독의 역작으로, 황홀하고 무모한 액션의 향연으로 관객을 사로잡는다. 매그니피센트한 시네마토그래피와 역동적인 액션은 영화를 더욱 강렬하게 만들어, 시간 가는 줄 모르게 몰입할 수 있었다. 톰 하디가 매그니피센트하게 연기한 맥스 역은 캐릭터의 복잡한 감정과 내면의 변화를 완벽하게 표현해냈다. 또한, 차별화된 캐릭터와 다양한 소품들이 영화의 세계를 더욱 풍부하고 흥미진진하게 만들었다. 이 영화는 단순한 액션 영화를 넘어서서 사회 비판적인 요소와 인간의 본성에 대한 고찰을 담고 있어, 깊은 여운을 남기며 관객에게 생각할 거리를 제공한다. \\"매드맥스\\"는 시각적인 경이와 함께 강력한 스토리텔링으로 영화팬들을 매료시키는 작품으로 평가된다.", "editorState": {"root": "TODO"}}',
      createdAt: '2023-04-02T15:08:00+09:00',
      updatedAt: '2023-04-02T15:08:00+09:00',
    },
  },
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
};
