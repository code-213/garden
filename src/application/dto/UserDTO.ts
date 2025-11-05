export interface CreateUserDTO {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
}

export interface UpdateUserDTO {
  name?: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  location?: string;
  role: string;
  status: string;
  createdAt: Date;
}
