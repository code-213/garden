import { ITreeRepository } from '@domain/repositories/ITreeRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Tree, TreeProps } from '@domain/entities/Tree';
import { Location } from '@domain/value-objects/Location';
import { TreeStatus } from '@domain/value-objects/TreeStatus';
import { UnauthorizedError, ValidationError } from '@shared/errors';

export interface PlantTreeDTO {
  userId: string;
  species: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: string;
  notes?: string;
}

export class PlantTreeUseCase {
  constructor(
    private readonly treeRepository: ITreeRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: PlantTreeDTO): Promise<Tree> {
    // Verify user exists and is active
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    if (!user.isActive()) {
      throw new UnauthorizedError('User account is not active');
    }

    // Validate species
    if (!dto.species || dto.species.trim().length === 0) {
      throw new ValidationError('Species is required');
    }

    // Create location value object
    const location = Location.create(dto.location);

    // Create tree entity
    const treeProps: TreeProps = {
      species: dto.species.trim(),
      plantedBy: dto.userId,
      plantedDate: new Date(),
      location,
      status: TreeStatus.Healthy,
      waterCount: 0,
      image: dto.image,
      notes: dto.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tree = Tree.create(treeProps);

    // Save to repository
    return await this.treeRepository.save(tree);
  }
}
