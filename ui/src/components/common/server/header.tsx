import { NavLinks } from '@/components/common/client/nav-links';
import Logo from '@/components/common/server/logo';
import SideBar from '@/components/common/client/sidebar';
import Link from 'next/link';
import SignButton from '@/components/auth/client/sign-button';

export function Header() {
  return (
    <header className="z-20 flex w-full items-center gap-4 border-b bg-white px-6 py-4">
      <div className="block">
        <Link href="/" scroll={false}>
          <Logo />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <nav className="hidden items-center gap-4 sm:flex">
          <NavLinks />
        </nav>
        <SignButton />
        <nav className="flex items-center sm:hidden">
          <SideBar SignButton={<SignButton />} />
        </nav>
      </div>
    </header>
  );
}
