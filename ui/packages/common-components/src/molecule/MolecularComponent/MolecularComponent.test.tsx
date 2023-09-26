import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as Stories from './MolecularComponent.stories'; // import all stories from the stories file
import { MolecularComponent } from '.'; // import the component itself
import { describe, it, expect } from 'vitest';

const { Primary, Secondary } = composeStories(Stories);

describe('MolecularComponent', () => {
  it("has class 'text-blue-300' on Primary", () => {
    const { getByTestId } = render(<Primary />);

    expect(getByTestId('color')).toHaveClass('text-blue-300');
  });

  it("has class 'text-blue-600' on Secondary", () => {
    const { getByTestId } = render(<Secondary />);

    expect(getByTestId('color')).toHaveClass('text-blue-600');
  });

  it('renders description', () => {
    const { getByText } = render(<MolecularComponent color='primary' description='description' />);

    expect(getByText('description')).toBeInTheDocument();
  });
});
