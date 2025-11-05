import { ITreeRepository } from '@domain/repositories/ITreeRepository';
import { Tree } from '@domain/entities/Tree';
import { NotFoundError, ValidationError } from '@shared/errors';

export interface WaterTreeDTO {
  treeId: string;
  userId: string;
  notes?: string;
}

export class WaterTreeUseCase {
  constructor(private readonly treeRepository: ITreeRepository) {}

  async execute(dto: WaterTreeDTO): Promise<Tree> {
    // Find tree
    const tree = await this.treeRepository.findById(dto.treeId);
    if (!tree) {
      throw new NotFoundError('Tree not found');
    }

    // Check if tree can be watered
    if (!tree.canBeWatered()) {
      throw new ValidationError('Tree was recently watered. Please wait 24 hours.');
    }

    // Water the tree (domain logic)
    tree.water(dto.userId);

    // Save changes
    return await this.treeRepository.update(tree);
  }
}
