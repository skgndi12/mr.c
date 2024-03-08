'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';

import { isString } from '@/lib/utils/common/is-string';

interface SearchFormState {
  error?: string | null;
  // todo: this should be an object that contains errors for each field
  // instead of one error string
}

export function useSearchFormState(filters: string[]) {
  const pathname = usePathname();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/require-await
  async function searchAction(prevState: SearchFormState, formData: FormData) {
    const params = new URLSearchParams();

    for (const filter of filters) {
      const data = formData.get(filter);

      if (data) {
        if (!isString(data)) {
          return { error: `${filter} data should be string but is ${typeof data}` };
          // todo: handle error properly
          // todo: handle length error after deciding policy
        }

        const trimmed = data.trim();
        if (trimmed) params.set(filter, trimmed);
      }
    }

    router.push(`${pathname}?${params.toString()}`);
    return { error: null };
  }

  const initialState: SearchFormState = { error: null };
  const [state, formAction] = useFormState(searchAction, initialState);

  useEffect(() => {
    if (state?.error) {
      alert(state.error); // todo: replace with emitting toast
    }
  }, [state]);

  return { formAction };
}
