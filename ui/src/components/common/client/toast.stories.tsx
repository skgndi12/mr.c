import type { Meta, StoryObj } from '@storybook/react';

import { ToastProvider, useToast } from '@/context/common/toast-context';

const meta = {
  title: 'Common/Toast',
  component: ToastWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ToastWrapper />,
};

function ToastWrapper() {
  return (
    <ToastProvider>
      <ToastRenderer />
    </ToastProvider>
  );
}

function ToastRenderer() {
  const { emitToast } = useToast();

  return (
    <div className="flex flex-col space-x-2 p-4 sm:flex-row">
      <button
        className="whitespace-nowrap rounded-md px-6 py-3 shadow-xl"
        onClick={() => emitToast('Something done well !', 'success')}
      >
        Render a success toast
      </button>

      <button
        className="whitespace-nowrap rounded-md bg-black px-6 py-3 text-white shadow-xl"
        onClick={() => emitToast('Something went wrong !', 'error')}
      >
        Render a error toast
      </button>
    </div>
  );
}
