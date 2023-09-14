import { MyComponent } from '@/components/my-component';
import { hello } from '@mrc/common-utils';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('renders `Hello Mr.C ! ', () => {
    const name = 'Mr.C';

    render(<MyComponent name={name} />);

    const msg = hello(name);

    expect(screen.getByText(msg)).toBeInTheDocument();
  });
});
