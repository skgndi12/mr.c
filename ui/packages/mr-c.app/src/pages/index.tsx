import { hello } from '@mrc/common-utils';

export default function Home() {
  const helloMrC = hello('Mr C');

  return <>{helloMrC}</>;
}
