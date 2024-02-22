'use client';

import Text from '@/components/atomic/text';
import { useDropdown } from '@/hooks/use-dropdown';

export default function UserChip({ nickname, tag }: { nickname: string; tag: string }) {
  const { targetRef, toggleDropdown, isDropdownOpen } = useDropdown<HTMLDivElement>();

  return (
    <div ref={targetRef} className="relative">
      <div
        className="flex w-fit items-center rounded bg-gray-100 px-1 hover:bg-gray-200"
        onClick={toggleDropdown}
        data-testid="user-chip"
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
