import { ITreeRepository } from '@domain/repositories/ITreeRepository';
import { NotFoundError, UnauthorizedError } from '@shared/errors';

export interface DeleteTreeDTO {
  treeId: string;
  userId: string;
  isAdmin: boolean;
}

export class DeleteTreeUseCase {
  constructor(private readonly treeRepository: ITreeRepository) {}

  async execute(dto: DeleteTreeDTO): Promise<void> {
    const tree = await this.treeRepository.findById(dto.treeId);
    if (!tree) {
      throw new NotFoundError('Tree not found');
    }

    // Check authorization
    if (!dto.isAdmin && tree.plantedBy !== dto.userId) {
      throw new UnauthorizedError('You can only delete your own trees');
    }

    await this.treeRepository.delete(dto.treeId);
  }
}
