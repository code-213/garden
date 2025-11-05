import { IFireRepository, FireFilters } from '@domain/repositories/IFireRepository';
import { Fire, FireProps } from '@domain/entities/Fire';
import { FireModel, IFireDocument } from '../models/FireModel';
import { Location } from '@domain/value-objects/Location';
import { PaginatedResult } from '@domain/repositories/IUserRepository';

export class FireRepository implements IFireRepository {
  async findById(id: string): Promise<Fire | null> {
    const doc = await FireModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Fire[]> {
    const docs = await FireModel.find({ reportedBy: userId }).sort({ reportedDate: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findAll(filters?: FireFilters): Promise<PaginatedResult<Fire>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.severity) query.severity = filters.severity;
    if (filters?.reportedBy) query.reportedBy = filters.reportedBy;

    const [docs, total] = await Promise.all([
      FireModel.find(query).skip(skip).limit(limit).sort({ reportedDate: -1 }),
      FireModel.countDocuments(query)
    ]);

    return {
      items: docs.map(doc => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async save(fire: Fire): Promise<Fire> {
    const fireData = this.toPersistence(fire);
    const doc = new FireModel(fireData);
    await doc.save();
    return this.toDomain(doc);
  }

  async update(fire: Fire): Promise<Fire> {
    const fireData = this.toPersistence(fire);
    const doc = await FireModel.findByIdAndUpdate(fire.id, fireData, {
      new: true,
      runValidators: true
    });
    if (!doc) throw new Error('Fire report not found');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await FireModel.findByIdAndDelete(id);
  }

  async countByUserId(userId: string): Promise<number> {
    return await FireModel.countDocuments({ reportedBy: userId });
  }

  private toDomain(doc: IFireDocument): Fire {
    const props: FireProps = {
      reportedBy: doc.reportedBy,
      location: Location.create(doc.location),
      severity: doc.severity,
      status: doc.status,
      description: doc.description,
      reportedDate: doc.reportedDate,
      updatedDate: doc.updatedDate,
      images: doc.images,
      affectedAreaSqm: doc.affectedAreaSqm,
      responseTeam: doc.responseTeam,
      resolvedDate: doc.resolvedDate,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return Fire.create(props, doc._id.toString());
  }

  private toPersistence(fire: Fire): any {
    return {
      _id: fire.id,
      reportedBy: fire.reportedBy,
      location: fire.location.toJSON(),
      severity: fire.severity,
      status: fire.status,
      description: fire.description,
      reportedDate: fire.reportedDate,
      updatedDate: fire.updatedDate,
      images: fire.images,
      affectedAreaSqm: fire.affectedAreaSqm,
      responseTeam: fire.responseTeam,
      resolvedDate: fire.resolvedDate
    };
  }
}
