import { IFireRepository, FireFilters } from '@domain/repositories/IFireRepository';
import { Fire } from '@domain/entities/Fire';
import { PaginatedResult } from '@domain/repositories/IUserRepository';

export class GetFiresUseCase {
  constructor(private readonly fireRepository: IFireRepository) {}

  async execute(filters?: FireFilters): Promise<PaginatedResult<Fire>> {
    return await this.fireRepository.findAll(filters);
  }
}
