import { NavLinks } from '@/components/layout/nav-links';
import Logo from '@/components/logo';
import SideBar from '@/components/layout/sidebar';
import Text from '@/components/atomic/text';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 flex w-full items-center gap-4 border-b px-6 py-4">
      <div className="absolute inset-0 -z-10 w-full bg-white/30 backdrop-blur-sm" />
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

function SignButton() {
  return (
    // TODO: use server action
    <form className="hover:cursor-pointer">
      <Text size="lg" weight="medium">
        Sign In
      </Text>
    </form>
  );
}
