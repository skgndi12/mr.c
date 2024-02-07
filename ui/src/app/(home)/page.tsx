import Link from 'next/link';

export default function Home() {
  return (
    <>
      <h1>This is Mr.C home</h1>
      <Link href="/review">review</Link>
      <br />
      <Link href="/comment">comment</Link>
    </>
  );
}
