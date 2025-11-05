import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User, UserProps } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { IAuthService } from '@application/interfaces/IAuthService';

export interface GoogleLoginDTO {
  code: string;
}

export interface GoogleLoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class GoogleLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(dto: GoogleLoginDTO): Promise<GoogleLoginResult> {
    // Exchange code for Google user data
    const googleUser = await this.authService.verifyGoogleToken(dto.code);

    // Find or create user
    let user = await this.userRepository.findByGoogleId(googleUser.id);

    if (!user) {
      // Create new user
      const userProps: UserProps = {
        email: Email.create(googleUser.email),
        name: googleUser.name,
        avatar: googleUser.picture,
        googleId: googleUser.id,
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      user = await this.userRepository.save(User.create(userProps));
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = 
      await this.authService.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn
    };
  }
}
