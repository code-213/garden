import { IFireRepository } from '@domain/repositories/IFireRepository';
import { Fire } from '@domain/entities/Fire';
import { NotFoundError } from '@shared/errors';

export class GetFireDetailsUseCase {
  constructor(private readonly fireRepository: IFireRepository) {}

  async execute(fireId: string): Promise<Fire> {
    const fire = await this.fireRepository.findById(fireId);
    if (!fire) {
      throw new NotFoundError('Fire report not found');
    }
    return fire;
  }
}
