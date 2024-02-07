export interface CommentData {
  id: number;
  userId: string;
  movieName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly movieName: string,
    public readonly content: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public getData = (): CommentData => {
    return {
      id: this.id,
      userId: this.userId,
      movieName: this.movieName,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  };
}
