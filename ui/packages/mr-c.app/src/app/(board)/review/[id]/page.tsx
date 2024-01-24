import Link from 'next/link';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <h1>This is review#{params.id} detail</h1>
      <Link href={`/review/${params.id}/edit`}>edit</Link>
    </>
  );
}
