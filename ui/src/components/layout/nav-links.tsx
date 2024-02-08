'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Text from '@/components/atomic/text';

interface Link {
  name: string;
  href: string;
}

const links: Link[] = [
  { name: 'Review', href: '/review' },
  { name: 'Comment', href: '/comment' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        return (
          <Link key={link.name} href={link.href} scroll={false}>
            <Text size="lg" weight={pathname.startsWith(link.href) ? 'black' : 'medium'}>
              {link.name}
            </Text>
          </Link>
        );
      })}
    </>
  );
}
