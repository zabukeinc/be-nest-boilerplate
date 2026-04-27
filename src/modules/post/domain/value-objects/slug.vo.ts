export class Slug {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Slug cannot be empty');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw new Error(`Invalid slug format: ${value}`);
    }
  }

  static create(title: string): Slug {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return new Slug(slug);
  }

  static fromString(slug: string): Slug {
    return new Slug(slug);
  }

  getValue(): string {
    return this.value;
  }
  equals(other: Slug): boolean {
    return this.value === other.value;
  }
  toString(): string {
    return this.value;
  }
}
