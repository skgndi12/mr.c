import { Header } from '@/components/common/server/header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <>{children}</>
    </>
  );
}
