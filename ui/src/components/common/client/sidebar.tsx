'use client';

import { useEffect, useState } from 'react';
import { NavLinks } from '@/components/common/client/nav-links';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Sidebar({ SignButton }: { SignButton: JSX.Element }) {
  const [isOpen, setIsOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setIsOpen(false), [path]);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        <Bars3Icon className="w-6" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="fixed right-0 top-0 z-20 flex h-screen flex-col gap-4 bg-white px-6 py-4">
            {/* TODO: h-[52px] is for temporal LOGO size. */}
            <div className="flex h-[52px] items-center gap-4">
              {SignButton}
              <XMarkIcon className="w-6" onClick={() => setIsOpen(false)} />
            </div>
            <NavLinks />
          </div>
        </>
      )}
    </>
  );
}
