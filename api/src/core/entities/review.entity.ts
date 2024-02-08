export interface ReviewData {
  id: number;
  userId: string;
  title: string;
  movieName: string;
  content: string;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplyData {
  id: number;
  reviewId: number;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Review {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly title: string,
    public readonly movieName: string,
    public readonly content: string,
    public readonly replyCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public getData = (): ReviewData => {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      movieName: this.movieName,
      content: this.content,
      replyCount: this.replyCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  };
}

export class Reply {
  constructor(
    public readonly id: number,
    public readonly reviewId: number,
    public readonly userId: string,
    public readonly content: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public getData = (): ReplyData => {
    return {
      id: this.id,
      reviewId: this.reviewId,
      userId: this.userId,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  };
}
