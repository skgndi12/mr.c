import dynamic from 'next/dynamic';

import Text from '@/components/common/server/text';

const Time = dynamic(() => import('@/components/common/client/client-time'), {
  ssr: false,
  loading: () => (
    <div className="inline-block">
      <Text size={Time.defaultProps?.size}> </Text>
    </div>
  ),
});

export default Time;
