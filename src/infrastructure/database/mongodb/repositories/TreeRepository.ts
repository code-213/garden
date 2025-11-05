import { ITreeRepository, TreeFilters } from '@domain/repositories/ITreeRepository';
import { Tree, TreeProps } from '@domain/entities/Tree';
import { TreeModel, ITreeDocument } from '../models/TreeModel';
import { Location } from '@domain/value-objects/Location';
import { TreeStatus } from '@domain/value-objects/TreeStatus';
import { PaginatedResult } from '@domain/repositories/IUserRepository';

export class TreeRepository implements ITreeRepository {
  async findById(id: string): Promise<Tree | null> {
    const doc = await TreeModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Tree[]> {
    const docs = await TreeModel.find({ plantedBy: userId }).sort({ plantedDate: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findAll(filters?: TreeFilters): Promise<PaginatedResult<Tree>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters?.userId) query.plantedBy = filters.userId;
    if (filters?.species) query.species = new RegExp(filters.species, 'i');
    if (filters?.status) query.status = filters.status;

    const [docs, total] = await Promise.all([
      TreeModel.find(query).skip(skip).limit(limit).sort({ plantedDate: -1 }),
      TreeModel.countDocuments(query)
    ]);

    return {
      items: docs.map(doc => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async save(tree: Tree): Promise<Tree> {
    const treeData = this.toPersistence(tree);
    const doc = new TreeModel(treeData);
    await doc.save();
    return this.toDomain(doc);
  }

  async update(tree: Tree): Promise<Tree> {
    const treeData = this.toPersistence(tree);
    const doc = await TreeModel.findByIdAndUpdate(tree.id, treeData, {
      new: true,
      runValidators: true
    });
    if (!doc) throw new Error('Tree not found');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await TreeModel.findByIdAndDelete(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return await TreeModel.countDocuments({ plantedBy: userId });
  }

  private toDomain(doc: ITreeDocument): Tree {
    const props: TreeProps = {
      _id: doc._id.toString(),
      species: doc.species,
      plantedBy: doc.plantedBy,
      plantedDate: doc.plantedDate,
      location: Location.create(doc.location),
      status: doc.status as TreeStatus,
      height: doc.height,
      waterCount: doc.waterCount,
      lastWatered: doc.lastWatered,
      image: doc.image,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return Tree.create(props, doc._id.toString());
  }
  private toPersistence(tree: Tree): any {
    return {
      species: tree.species,
      plantedBy: tree.plantedBy,
      plantedDate: tree.plantedDate,
      location: tree.location.toJSON(),
      status: tree.status,
      height: tree.height,
      waterCount: tree.waterCount,
      lastWatered: tree.lastWatered,
      image: tree.image,
      notes: tree.notes
    };
  }
}
