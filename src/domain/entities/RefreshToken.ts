import { Entity } from './base/Entity';

export interface RefreshTokenProps {
  token: string;
  userId: string;
  familyId: string; // For token rotation tracking
  expiresAt: Date;
  isUsed: boolean;
  isRevoked: boolean;
  replacedBy?: string; // Token that replaced this one
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps, id?: string) {
    super(props, id);
  }

  public static create(props: RefreshTokenProps, id?: string): RefreshToken {
    return new RefreshToken(props, id);
  }

  // Getters
  get token(): string {
    return this.props.token;
  }

  get userId(): string {
    return this.props.userId;
  }

  get familyId(): string {
    return this.props.familyId;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isUsed(): boolean {
    return this.props.isUsed;
  }

  get isRevoked(): boolean {
    return this.props.isRevoked;
  }

  get replacedBy(): string | undefined {
    return this.props.replacedBy;
  }

  get deviceInfo(): { userAgent: string; ipAddress: string } | undefined {
    return this.props.deviceInfo;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public isValid(): boolean {
    return !this.props.isUsed && !this.props.isRevoked && !this.isExpired();
  }

  public markAsUsed(replacementToken?: string): void {
    if (this.props.isUsed) {
      throw new Error('Token is already used');
    }
    if (this.props.isRevoked) {
      throw new Error('Token is revoked');
    }

    this.props.isUsed = true;
    this.props.replacedBy = replacementToken;
    this.props.updatedAt = new Date();
  }

  public revoke(): void {
    this.props.isRevoked = true;
    this.props.updatedAt = new Date();
  }
}
