import { MyComponent } from '@/components/my-component';
import { hello } from '@mrc/common-utils';
import { render, screen } from '@testing-library/react';

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Hello from API' }),
    } as Response);
  });
});

afterEach(() => {
  fetchSpy.mockRestore();
});

describe('MyComponent', () => {
  it('renders Hello Mr.C ! ', async () => {
    const name = 'Mr.C';

    render(await MyComponent({ name }));

    const msg = hello(name);

    expect(screen.getByText(msg)).toBeInTheDocument();
  });

  it('calls fetchHello once', async () => {
    render(await MyComponent({ name: 'test' }));

    expect(fetchSpy).toBeCalledTimes(1);
  });
});
