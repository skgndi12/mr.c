import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Title, { type TitleRef } from '@/components/common/client/title';

const meta = {
  title: 'Common/Title',
  component: Title,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { value: '' },
  argTypes: {
    value: {
      control: false,
    },
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TitleWrapper />,
};

export const Subtitle: Story = {
  render: () => <TitleWrapper subtitle />,
};

function TitleWrapper({ subtitle }: { subtitle?: boolean }) {
  const [text, setText] = useState('');

  const ref = useRef<TitleRef>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // regex for remove newline: https://stackoverflow.com/questions/10805125
    let newText = e.target.value.replace(/\r?\n|\r/g, ' ');
    // regex for remove multiple spaces: https://stackoverflow.com/questions/1981349
    newText = newText.replace(/\s\s+/g, ' ');

    // limit the length of the text
    const MAX_LENGTH = 100;
    if (newText.length > MAX_LENGTH) {
      newText = newText.slice(0, MAX_LENGTH);

      alert(`${subtitle ? '영화 제목' : '제목'}은 ${MAX_LENGTH}자 이하로 입력해주세요.`);
    }

    setText(newText);
  };

  const [readOnly, setReadOnly] = useState(false);

  return (
    <div className="flex w-full flex-col justify-center space-y-4 px-2 py-16">
      <button
        className="mr-auto rounded-md bg-blue-500 px-2 py-1 text-white"
        onClick={() => {
          ref.current?.focus();
        }}
      >
        {`Focus on ${subtitle ? 'Subtitle' : 'Title'}`}
      </button>

      <button
        className="mr-auto rounded-md bg-blue-500 px-2 py-1 text-white"
        onClick={() => {
          setReadOnly(!readOnly);
        }}
      >
        {`${readOnly ? 'Start' : 'Stop'} editing`}
      </button>

      <Title
        ref={ref}
        value={text}
        onChange={onChange}
        placeholder={subtitle ? 'Subtitle' : 'Title'}
        subtitle={subtitle}
        readOnly={readOnly}
      />
    </div>
  );
}
