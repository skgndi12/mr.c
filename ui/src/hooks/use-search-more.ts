import { useRouter } from 'next/navigation';

// TODO: consider to make it more generic by using useSearchParams
export function useSearchMore(nickname: string) {
  const params = new URLSearchParams();
  params.set('nickname', nickname);

  const createURL = (pathname: 'review' | 'comment') => `/${pathname}?${params.toString()}`;

  const router = useRouter();

  const saerchMoreReview = () => router.push(createURL('review'));
  const saerchMoreComment = () => router.push(createURL('comment'));

  return { saerchMoreReview, saerchMoreComment };
}
