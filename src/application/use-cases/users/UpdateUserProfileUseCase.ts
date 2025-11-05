import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { NotFoundError, UnauthorizedError } from '@shared/errors';

export interface UpdateUserProfileDTO {
  userId: string;
  requesterId: string;
  name?: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: UpdateUserProfileDTO): Promise<User> {
    // Authorization check
    if (dto.userId !== dto.requesterId) {
      throw new UnauthorizedError('You can only update your own profile');
    }

    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update profile using domain method
    user.updateProfile(dto.name, dto.bio, dto.location, dto.avatar);

    return await this.userRepository.update(user);
  }
}
