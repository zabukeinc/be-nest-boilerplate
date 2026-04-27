export abstract class BaseEntity {
  abstract getId(): string;
  abstract getCreatedAt(): Date;
  abstract getUpdatedAt(): Date;

  isDeleted(): boolean {
    return this.getDeletedAt() !== null;
  }

  abstract getDeletedAt(): Date | null;

  markDeleted(): void {
    throw new Error('markDeleted must be implemented by subclass');
  }
}
