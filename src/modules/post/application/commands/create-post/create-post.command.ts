export class CreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly authorId: string,
    public readonly content?: string,
    public readonly imageUrl?: string,
  ) {}
}
