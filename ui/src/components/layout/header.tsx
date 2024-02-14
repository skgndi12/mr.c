import { NavLinks } from '@/components/layout/nav-links';
import Logo from '@/components/logo';
import SideBar from '@/components/layout/sidebar';
import Link from 'next/link';
import { SignButton } from '@/components/layout/sign-button';
import { cookies } from 'next/headers';

export function Header() {
  const isLoggedIn = !!cookies().get('mrcToken');

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
        <SignButton isLoggedIn={isLoggedIn} />
        <nav className="flex items-center sm:hidden">
          <SideBar SignButton={<SignButton isLoggedIn={isLoggedIn} />} />
        </nav>
      </div>
    </header>
  );
}