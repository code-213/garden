import { ITreeRepository, TreeFilters } from '@domain/repositories/ITreeRepository';
import { Tree } from '@domain/entities/Tree';
import { PaginatedResult } from '@domain/repositories/IUserRepository';

export class GetTreesUseCase {
  constructor(private readonly treeRepository: ITreeRepository) {}

  async execute(filters?: TreeFilters): Promise<PaginatedResult<Tree>> {
    return await this.treeRepository.findAll(filters);
  }
}
