import { AtomicComponent, MolecularComponent } from '@mrc/common-components';
import { hello } from '@mrc/common-utils';

async function fetchHello() {
  const response = await fetch('http://localhost:3000/api/hello', { cache: 'no-cache' });

  if (!response.ok) {
    throw new Error('fail to fetch hello');
  }

  const data = (await response.json()) as { message: string };

  return data;
}

// TODO: This codes are just for testing purpose. Must remove it later.
export async function MyComponent({ name }: { name: string }) {
  const msg = hello(name);
  const { message: helloFromApi } = await fetchHello();

  return (
    <>
      <AtomicComponent color="secondary" />
      <MolecularComponent color="primary" description={msg} />
      <MolecularComponent color="primary" description={helloFromApi} />
    </>
  );
}
