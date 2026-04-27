import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';

export class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private name: string | null,
    private avatarUrl: string | null,
    private role: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  static create(email: string, name?: string): User {
    const now = new Date();
    return new User(
      UserId.create(),
      Email.create(email),
      name || null,
      null,
      'user',
      now,
      now,
      null,
    );
  }

  static reconstitute(
    id: string,
    email: string,
    name: string | null,
    avatarUrl: string | null,
    role: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ): User {
    return new User(
      UserId.create(id),
      Email.create(email),
      name,
      avatarUrl,
      role,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  getId(): string {
    return this.id.getValue();
  }
  getEmail(): string {
    return this.email.getValue();
  }
  getName(): string | null {
    return this.name;
  }
  getAvatarUrl(): string | null {
    return this.avatarUrl;
  }
  getRole(): string {
    return this.role;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
  updateAvatarUrl(avatarUrl: string): void {
    this.avatarUrl = avatarUrl;
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
