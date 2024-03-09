// TODO: Remove dummy after connected with backend apis

import type { ListCommentsResponse } from '@/lib/definitions/comment';

const dummyCommentList: ListCommentsResponse = {
  comments: [
    {
      id: 1,
      userId: '7289ae9c-42b1-49ca-8f5b-a1831583e903',
      nickname: '신비로운 평론가 붉은 여우',
      tag: '#MQ3B',
      movieName: '서울의 봄',
      content: '전두환대머리',
      createdAt: '2023-04-02T15:08:00+09:00',
      updatedAt: '2023-04-02T15:08:00+09:00',
    },
    {
      id: 2,
      userId: '7289ae9c-42b1-49ca-8f5b-a1831583e903',
      nickname: '신비로운 평론가 붉은 여우',
      tag: '#MQ3B',
      movieName: '서울의 봄',
      content: '김성원검은머리',
      createdAt: '2023-04-02T15:08:00+09:00',
      updatedAt: '2023-04-02T15:08:00+09:00',
    },
    {
      id: 3,
      userId: '7289ae9c-42b1-49ca-8f5b-a1831583e903',
      nickname: '신비로운 평론가 붉은 여우',
      tag: '#MQ3B',
      movieName: '서울의 봄',
      content: '이수혁마빡이',
      createdAt: '2023-04-02T15:08:00+09:00',
      updatedAt: '2023-04-02T15:08:00+09:00',
    },
    {
      id: 4,
      userId: '7289ae9c-42b1-49ca-8f5b-a1831583e903',
      nickname: '신비로운 평론가 붉은 여우',
      tag: '#MQ3B',
      movieName: '서울의 봄',
      content: '겨울은 춥다 여름은 덥다 봄은 좋다 가을도 좋다 하하하어어어어',
      createdAt: '2023-04-02T15:08:00+09:00',
      updatedAt: '2023-04-02T15:08:00+09:00',
    },
    {
      id: 5,
      userId: '7289ae9c-42b1-49ca-8f5b-a1831583e903',
      nickname: '신비로운 평론가 붉은 여우',
      tag: '#MQ3B',
      movieName: '서울의 봄',
      content: '전라도와 경상도를 가로지르는',
      createdAt: '2023-04-02T15:08:00+09:00',
      updatedAt: '2023-04-02T15:08:00+09:00',
    },
  ],
  pagination: {
    pageOffset: 1,
    pageSize: 5,
    totalEntryCount: 48,
    totalPageCount: 10,
    direction: 'desc',
    sortBy: 'createdAt',
  },
};

export default dummyCommentList;
