
import { v4 as uuidv4 } from 'uuid';

export class UserId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  public static create(id?: string): UserId {
    if (id) {
      if (!UserId.isValidUUID(id)) {
        throw new Error('Invalid UUID format');
      }
      return new UserId(id);
    }
    return new UserId(uuidv4());
  }

  private static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}