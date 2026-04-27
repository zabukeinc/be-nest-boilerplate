export class CreateEntityCommand {
  constructor(public readonly data: any) {}
}

export class UpdateEntityCommand {
  constructor(
    public readonly id: string,
    public readonly data: any,
  ) {}
}

export class DeleteEntityCommand {
  constructor(public readonly id: string) {}
}
