import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { IAuthService } from '@application/interfaces/IAuthService';
import { UnauthorizedError, ValidationError } from '@shared/errors';
import { logger } from '@shared/utils/logger';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(dto: LoginDTO): Promise<LoginResult> {
    // 1. Validate input
    if (!dto.email || !dto.password) {
      throw new ValidationError('Email and password are required');
    }

    // 2. Find user by email
    const emailObj = Email.create(dto.email);
    const user = await this.userRepository.findByEmail(emailObj.getValue());

    if (!user) {
      logger.warn('Login attempt with non-existent email', { email: dto.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Check if user has a password (not OAuth-only user)
    if (!user.password) {
      logger.warn('Login attempt for OAuth-only account', {
        userId: user.id,
        email: dto.email
      });
      throw new UnauthorizedError('This account uses Google Sign-In. Please log in with Google.');
    }

    // 4. Verify password
    const isPasswordValid = await user.password.compare(dto.password);

    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', {
        userId: user.id,
        email: dto.email
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // 5. Check user status
    if (!user.isActive()) {
      logger.warn('Login attempt by inactive user', {
        userId: user.id,
        status: user.status
      });
      throw new UnauthorizedError(`Account is ${user.status}. Please contact support.`);
    }

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email.getValue()
    });

    // 6. Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.authService.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn
    };
  }
}
