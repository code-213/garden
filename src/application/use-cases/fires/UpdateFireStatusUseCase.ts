import { IFireRepository } from '@domain/repositories/IFireRepository';
import { FireStatus } from '@domain/entities/Fire';
import { NotFoundError, ForbiddenError } from '@shared/errors';

export interface UpdateFireStatusDTO {
  fireId: string;
  newStatus: FireStatus;
  notes?: string;
  userId: string;
  isAdmin: boolean;
}

export class UpdateFireStatusUseCase {
  constructor(private readonly fireRepository: IFireRepository) {}

  async execute(dto: UpdateFireStatusDTO): Promise<void> {
    if (!dto.isAdmin) {
      throw new ForbiddenError('Only admins can update fire status');
    }

    const fire = await this.fireRepository.findById(dto.fireId);
    if (!fire) {
      throw new NotFoundError('Fire report not found');
    }

    fire.updateStatus(dto.newStatus, dto.notes);
    await this.fireRepository.update(fire);
  }
}
