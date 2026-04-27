import { IEvent } from '@nestjs/cqrs';

export class ProductCreatedEvent implements IEvent {
  constructor(
    public readonly productId: string,
    public readonly name: string,
  ) {}
}
