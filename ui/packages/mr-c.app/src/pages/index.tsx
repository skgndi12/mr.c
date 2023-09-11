import { AtomicComponent, MolecularComponent } from '@mrc/common-components';
import { hello } from '@mrc/common-utils';

export default function Home() {
  // TODO: This codes are just for testing purpose. Must remove it later.
  const helloMrC = hello('Mr C');

  return (
    <>
      <p className='headline-1-semibold'>{helloMrC}</p>
      <AtomicComponent color='primary' />
      <MolecularComponent color='secondary' description='This is a description' />
    </>
  );
}
