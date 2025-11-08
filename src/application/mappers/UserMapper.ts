import { User } from '@domain/entities/User';

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  location: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export class UserMapper {
  static toDTO(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email.getValue(),
      name: user.name,
      bio: user.bio || null,
      avatar: user.avatar || null,
      location: user.location || null,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString()
    };
  }

  static toPublicDTO(user: User) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar || null,
      bio: user.bio || null,
      location: user.location || null
    };
  }
}
