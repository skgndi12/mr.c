'use client';

import Text from '@/components/atomic/text';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { useRef, useState } from 'react';

export default function UserChip({ nickname, tag }: { nickname: string; tag: string }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => setDropdownOpen((prev) => !prev);
  useOutsideClick({ ref, handler: () => setDropdownOpen(false) });

  return (
    <div ref={ref} className="relative">
      <div
        className="flex w-fit items-center rounded bg-gray-100 px-1 hover:bg-gray-200"
        onClick={handleClick}
      >
        <Text weight="medium" nowrap>
          {nickname}
        </Text>
        <Text size="sm" weight="light" nowrap>
          {tag}
        </Text>
      </div>
      {isDropdownOpen && (
        // TODO: replace with a normalized Dropdown with a proper event handler
        <div className="absolute right-0 top-7 flex items-center rounded-lg border bg-white px-2 py-1 opacity-70 hover:bg-gray-200">
          <Text color="black" size="sm">
            작성글 보기
          </Text>
        </div>
      )}
    </div>
  );
}
