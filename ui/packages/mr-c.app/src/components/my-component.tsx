import { MolecularComponent } from '@mrc/common-components';
import { hello } from '@mrc/common-utils';

// TODO: This codes are just for testing purpose. Must remove it later.
export const MyComponent = ({ name }: { name: string }) => {
  const msg = hello(name);

  return (
    <>
      <MolecularComponent color='primary' description={msg} />
    </>
  );
};
