import dynamic from 'next/dynamic';

import Text from '@/components/atomic/text';

const Time = dynamic(() => import('@/components/time/client-time'), {
  ssr: false,
  loading: () => (
    <div className="inline-block">
      <Text size={Time.defaultProps?.size}> </Text>
    </div>
  ),
});

export default Time;
