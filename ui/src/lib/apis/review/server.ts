'use server';

import { unstable_noStore as noStore } from 'next/cache';

import type { ListReviewsQuery, ListReviewsResponse } from '@/lib/definitions/review';
import dummyReviewList from '@/lib/dummy/review';

export async function listReviews(query: ListReviewsQuery): Promise<ListReviewsResponse> {
  noStore();

  const params = Object.entries(query).reduce((acc, [key, value]) => {
    if (value) {
      acc.set(key, String(value));
    }

    return acc;
  }, new URLSearchParams());

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews?${params.toString()}`);

    if (!response.ok) {
      throw new Error(
        `Network Error: Failed to fetch reviews list from BACKEND API: ${response.statusText}`
      );
    }

    return (await response.json()) as ListReviewsResponse;
  } catch (error) {
    // TODO: handle error
    // console.error('Fetch Error:', error);
    // throw new Error('Internal Server Error: Failed to fetch reviews list');

    // TODO: DELETE ME when reviews api works
    return await new Promise((resolve) => setTimeout(() => resolve(dummyReviewList), 1000));
  }
}
