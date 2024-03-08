'use client';

import ChipButton from '@/components/common/client/chip-button';
import Text from '@/components/common/server/text';
import { useDropdown } from '@/hooks/common/use-dropdown';
import { useSearchMore } from '@/hooks/common/use-search-more';

export default function UserChip({ nickname, tag }: { nickname: string; tag: string }) {
  const { targetRef, toggleDropdown, isDropdownOpen } = useDropdown<HTMLDivElement>();

  const { saerchMoreReview, saerchMoreComment } = useSearchMore(nickname);

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
        <div className="absolute left-0 top-7 z-10 flex-col items-center space-y-1 rounded-lg border bg-white p-2">
          <ChipButton
            onClick={saerchMoreReview}
            Text={<Text size="sm">작성 리뷰</Text>}
            rounded="lg"
            width="full"
          />
          <ChipButton
            onClick={saerchMoreComment}
            Text={<Text size="sm">작성 코멘트</Text>}
            rounded="lg"
            width="full"
          />
        </div>
      )}
    </div>
  );
}
