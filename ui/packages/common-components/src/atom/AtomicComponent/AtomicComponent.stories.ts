import type { Meta, StoryObj } from '@storybook/react';

import AtomicComponent from './AtomicComponent';

const meta = {
  title: 'Atom/AtomicComponent',
  component: AtomicComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AtomicComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};
