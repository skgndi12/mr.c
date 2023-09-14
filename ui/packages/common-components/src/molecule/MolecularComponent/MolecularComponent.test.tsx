import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as Stories from './MolecularComponent.stories'; // import all stories from the stories file
import { MolecularComponent } from '.'; // import the component itself
import { describe, it, expect } from 'vitest';

const { Primary, Secondary } = composeStories(Stories);

describe('MolecularComponent', () => {
  it("has class 'text-blue-300' on Primary", () => {
    const { getByText } = render(<Primary />);

    expect(getByText(Primary.args.description as string)).toHaveClass('text-blue-300');
  });

  it("has class 'text-blue-600' on Secondary", () => {
    const { getByText } = render(<Secondary />);

    expect(getByText(Secondary.args.description as string)).toHaveClass('text-blue-600');
  });

  it('renders description', () => {
    const { getByText } = render(<MolecularComponent color='primary' description='description' />);

    expect(getByText('description')).toBeInTheDocument();
  });
});
