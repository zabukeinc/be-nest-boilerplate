import { Slug } from '../value-objects/slug.vo';

export class Post {
  private constructor(
    private id: string,
    private title: string,
    private slug: Slug,
    private content: string | null,
    private imageUrl: string | null,
    private published: boolean,
    private authorId: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private publishedAt: Date | null,
    private deletedAt: Date | null,
  ) {}

  static create(title: string, authorId: string, content?: string): Post {
    const now = new Date();
    return new Post(
      '',
      title,
      Slug.create(title),
      content || null,
      null,
      false,
      authorId,
      now,
      now,
      null,
      null,
    );
  }

  static reconstitute(
    id: string,
    title: string,
    slug: string,
    content: string | null,
    imageUrl: string | null,
    published: boolean,
    authorId: string,
    createdAt: Date,
    updatedAt: Date,
    publishedAt: Date | null,
    deletedAt: Date | null,
  ): Post {
    return new Post(
      id,
      title,
      Slug.fromString(slug),
      content,
      imageUrl,
      published,
      authorId,
      createdAt,
      updatedAt,
      publishedAt,
      deletedAt,
    );
  }

  getId(): string {
    return this.id;
  }
  getTitle(): string {
    return this.title;
  }
  getSlug(): string {
    return this.slug.getValue();
  }
  getContent(): string | null {
    return this.content;
  }
  getImageUrl(): string | null {
    return this.imageUrl;
  }
  isPublished(): boolean {
    return this.published;
  }
  getAuthorId(): string {
    return this.authorId;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
  getPublishedAt(): Date | null {
    return this.publishedAt;
  }
  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  updateTitle(title: string): void {
    this.title = title;
    this.slug = Slug.create(title);
    this.updatedAt = new Date();
  }
  updateContent(content: string): void {
    this.content = content;
    this.updatedAt = new Date();
  }
  setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
    this.updatedAt = new Date();
  }

  publish(): void {
    if (this.published) throw new Error('Post is already published');
    this.published = true;
    this.publishedAt = new Date();
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
  markDeleted(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
