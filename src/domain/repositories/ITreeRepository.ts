import { Tree } from '../entities/Tree';

export interface ITreeRepository {
  findById(id: string): Promise<Tree | null>;
  findByUserId(userId: string): Promise<Tree[]>;
  findAll(filters?: TreeFilters): Promise<PaginatedResult<Tree>>;
  save(tree: Tree): Promise<Tree>;
  update(tree: Tree): Promise<Tree>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}

export interface TreeFilters {
  userId?: string;
  species?: string;
  status?: string;
  page?: number;
  limit?: number;
}
