import dynamic from 'next/dynamic';
const Time = dynamic(() => import('@/components/time/client-time'), { ssr: false });

export default Time;
