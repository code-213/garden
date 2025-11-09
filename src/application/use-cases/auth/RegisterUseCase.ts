import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User, UserProps } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';
import { IAuthService } from '@application/interfaces/IAuthService';
import { ValidationError } from '@shared/errors';
import { logger } from '@shared/utils/logger';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(dto: RegisterDTO): Promise<RegisterResult> {
    // 1. Validate input
    if (!dto.name || dto.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    if (!dto.email || !this.isValidEmail(dto.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!dto.password || dto.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // 2. Check if user already exists
    const emailObj = Email.create(dto.email);
    const existingUser = await this.userRepository.findByEmail(emailObj.getValue());

    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email: dto.email });
      throw new ValidationError('User with this email already exists');
    }

    // 3. Hash password
    const passwordObj = Password.create(dto.password);
    const hashedPassword = await passwordObj.hash();

    // 4. Create user entity
    const userProps: UserProps = {
      email: emailObj,
      name: dto.name.trim(),
      googleId: '', // Empty for email/password users
      password: hashedPassword,
      role: 'user',
      status: 'active',
      emailVerified: false, // Will be verified via email later
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const user = User.create(userProps);

    // 5. Save user to database
    const savedUser = await this.userRepository.save(user);

    logger.info('New user registered', {
      userId: savedUser.id,
      email: savedUser.email.getValue()
    });

    // 6. Generate tokens
    const { accessToken, refreshToken, expiresIn } =
      await this.authService.generateTokens(savedUser);

    return {
      user: savedUser,
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
