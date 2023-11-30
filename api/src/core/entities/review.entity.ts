export interface Review {
  id: number;
  userId: string;
  title: string;
  movieName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  id: number;
  reviewId: number;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
