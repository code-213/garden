// src/domain/entities/User.ts
// UPDATE THIS FILE - Add password support

import { Entity } from './base/Entity';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';

export interface UserProps {
  email: Email;
  name: string;
  bio?: string;
  avatar?: string;
  location?: string;
  googleId: string; // Empty string for email/password users
  password?: Password; // Optional - only for email/password auth
  emailVerified?: boolean; // Track if email is verified
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

  get password(): Password | undefined {
    return this.props.password;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified || false;
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

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  public updateProfile(name?: string, bio?: string, location?: string, avatar?: string): void {
    if (name) this.props.name = name;
    if (bio !== undefined) this.props.bio = bio;
    if (location !== undefined) this.props.location = location;
    if (avatar) this.props.avatar = avatar;
    this.props.updatedAt = new Date();
  }

  public async updatePassword(newPassword: string): Promise<void> {
    const passwordObj = Password.create(newPassword);
    this.props.password = await passwordObj.hash();
    this.props.updatedAt = new Date();
  }

  public verifyEmail(): void {
    this.props.emailVerified = true;
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

  public isGoogleUser(): boolean {
    return this.props.googleId !== '';
  }

  public isEmailPasswordUser(): boolean {
    return this.props.password !== undefined;
  }
}
