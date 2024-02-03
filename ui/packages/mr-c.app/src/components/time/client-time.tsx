'use client';

import { type Locale, formatDateToLocal } from '@/lib/utils/format-date-to-local';
import Text, { type TextProps } from '@/components/atomic/text';

interface Props extends Omit<TextProps, 'children'> {
  dateStr: string;
  locale?: Locale;
  relative?: boolean;
}

export default function ClientTime({
  dateStr,
  locale = 'ko-KR',
  relative = false,
  ...textProps
}: Props) {
  return <Text {...textProps}>{formatDateToLocal(dateStr, locale, relative)}</Text>;
}
