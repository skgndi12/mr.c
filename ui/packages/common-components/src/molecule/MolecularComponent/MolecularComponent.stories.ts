import type { Meta, StoryObj } from '@storybook/react';

import MolecularComponent from './MolecularComponent';

const meta = {
  title: 'Molecule/MolecularComponent',
  component: MolecularComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MolecularComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: 'primary',
    description: 'desc',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
    description: 'desc',
  },
};
