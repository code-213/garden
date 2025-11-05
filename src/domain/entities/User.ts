import { Entity } from './base/Entity';
import { Email } from '../value-objects/Email';

export interface UserProps {
  email: Email;
  name: string;
  bio?: string;
  avatar?: string;
  location?: string;
  googleId: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProps, id?: string): User {
    return new User(props, id);
  }

  // Getters
  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get location(): string | undefined {
    return this.props.location;
  }

  get googleId(): string {
    return this.props.googleId;
  }

  get role(): 'user' | 'admin' {
    return this.props.role;
  }

  get status(): 'active' | 'suspended' | 'banned' {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Business Methods
  public updateProfile(name?: string, bio?: string, location?: string, avatar?: string): void {
    if (name) this.props.name = name;
    if (bio !== undefined) this.props.bio = bio;
    if (location !== undefined) this.props.location = location;
    if (avatar) this.props.avatar = avatar;
    this.props.updatedAt = new Date();
  }

  public suspend(reason?: string): void {
    if (this.props.status === 'banned') {
      throw new Error('Cannot suspend a banned user');
    }
    this.props.status = 'suspended';
    this.props.updatedAt = new Date();
  }

  public ban(): void {
    this.props.status = 'banned';
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.status = 'active';
    this.props.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.props.status === 'active';
  }

  public isAdmin(): boolean {
    return this.props.role === 'admin';
  }
}
