import {
  IUserRepository,
  UserFilters,
  PaginatedResult
} from '@domain/repositories/IUserRepository';
import { User, UserProps } from '@domain/entities/User';
import { UserModel, IUserDocument } from '../models/UserModel';
import { Email } from '@domain/value-objects/Email';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toDomain(doc) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ googleId });
    return doc ? this.toDomain(doc) : null;
  }

  async save(user: User): Promise<User> {
    const userData = this.toPersistence(user);
    const doc = new UserModel(userData);
    await doc.save();
    return this.toDomain(doc);
  }

  async update(user: User): Promise<User> {
    const userData = this.toPersistence(user);
    const doc = await UserModel.findByIdAndUpdate(user.id, userData, {
      new: true,
      runValidators: true
    });
    if (!doc) throw new Error('User not found');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  async findAll(filters?: UserFilters): Promise<PaginatedResult<User>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const [docs, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserModel.countDocuments(query)
    ]);

    return {
      items: docs.map(doc => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  private toDomain(doc: IUserDocument): User {
    const props: UserProps = {
      email: Email.create(doc.email),
      name: doc.name,
      bio: doc.bio,
      avatar: doc.avatar,
      location: doc.location,
      googleId: doc.googleId,
      role: doc.role,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return User.create(props, doc._id.toString());
  }

  private toPersistence(user: User): any {
    return {
      _id: user.id,
      email: user.email.getValue(),
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      location: user.location,
      googleId: user.googleId,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };
  }
}
