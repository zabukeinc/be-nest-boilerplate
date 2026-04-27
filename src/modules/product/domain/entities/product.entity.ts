import { BaseEntity } from '@shared/base';

export class Product extends BaseEntity {
  private constructor(
    private readonly entityId: string,
    private name: string,
    private price: number,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {
    super();
  }

  static create(name: string, price: number): Product {
    const now = new Date();
    return new Product('', name, price, now, now, null);
  }

  static reconstitute(
    id: string,
    name: string,
    price: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ): Product {
    return new Product(id, name, price, createdAt, updatedAt, deletedAt);
  }

  getId(): string {
    return this.entityId;
  }
  getName(): string {
    return this.name;
  }
  getPrice(): number {
    return this.price;
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

  updatePrice(price: number): void {
    this.price = price;
    this.updatedAt = new Date();
  }

  markDeleted(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
