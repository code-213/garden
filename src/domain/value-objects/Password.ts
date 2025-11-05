import bcrypt from 'bcryptjs';

export class Password {
  private readonly value: string;
  private readonly hashed: boolean;

  private constructor(value: string, hashed: boolean = false) {
    this.value = value;
    this.hashed = hashed;
  }

  public static create(password: string): Password {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    return new Password(password, false);
  }

  public static createHashed(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  public async hash(): Promise<Password> {
    if (this.hashed) {
      return this;
    }
    const hashedValue = await bcrypt.hash(this.value, 10);
    return new Password(hashedValue, true);
  }

  public async compare(plainPassword: string): Promise<boolean> {
    if (!this.hashed) {
      throw new Error('Cannot compare unhashed password');
    }
    return bcrypt.compare(plainPassword, this.value);
  }

  public getValue(): string {
    return this.value;
  }

  public isHashed(): boolean {
    return this.hashed;
  }
}
