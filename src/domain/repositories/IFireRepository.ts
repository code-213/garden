import { Fire } from '../entities/Fire';
import { PaginatedResult } from './IUserRepository';

export interface IFireRepository {
  findById(id: string): Promise<Fire | null>;
  findByUserId(userId: string): Promise<Fire[]>;
  findAll(filters?: FireFilters): Promise<PaginatedResult<Fire>>;
  save(fire: Fire): Promise<Fire>;
  update(fire: Fire): Promise<Fire>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}

export interface FireFilters {
  status?: string;
  severity?: string;
  reportedBy?: string;
  page?: number;
  limit?: number;
}
