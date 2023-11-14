import { MyComponent } from '@/components/my-component';
import { hello } from '@mrc/common-utils';

export default function Home() {
  // TODO: This codes are just for testing purpose. Must remove it later.
  const helloMrC = hello('Mr C');

  return (
    <>
      <p className="headline-1-semibold">{helloMrC}</p>
      <MyComponent name="Mr C" />
    </>
  );
}
