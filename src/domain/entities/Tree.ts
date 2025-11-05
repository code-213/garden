import { Entity } from './base/Entity';
import { Location } from '../value-objects/Location';
import { TreeStatus } from '../value-objects/TreeStatus';

export interface TreeProps {
  species: string;
  plantedBy: string; // User ID
  plantedDate: Date;
  location: Location;
  status: TreeStatus;
  height?: number;
  waterCount: number;
  lastWatered?: Date;
  image?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Tree extends Entity<TreeProps> {
  private static readonly WATER_COOLDOWN_HOURS = 24;
  private static readonly MAX_WATER_COUNT = 1000;

  private constructor(props: TreeProps, id?: string) {
    super(props, id);
  }

  public static create(props: TreeProps, id?: string): Tree {
    return new Tree(props, id);
  }

  // Getters
  get species(): string {
    return this.props.species;
  }

  get plantedBy(): string {
    return this.props.plantedBy;
  }

  get plantedDate(): Date {
    return this.props.plantedDate;
  }

  get location(): Location {
    return this.props.location;
  }

  get status(): TreeStatus {
    return this.props.status;
  }

  get height(): number | undefined {
    return this.props.height;
  }

  get waterCount(): number {
    return this.props.waterCount;
  }

  get lastWatered(): Date | undefined {
    return this.props.lastWatered;
  }

  get image(): string | undefined {
    return this.props.image;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get ageDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.props.plantedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Business Methods
  //public water(userId: string): void {
  public water(): void {
    // Check cooldown
    if (this.props.lastWatered) {
      const hoursSinceLastWater =
        (new Date().getTime() - this.props.lastWatered.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastWater < Tree.WATER_COOLDOWN_HOURS) {
        const remainingHours = Math.ceil(Tree.WATER_COOLDOWN_HOURS - hoursSinceLastWater);
        throw new Error(`Tree was recently watered. Please wait ${remainingHours} hours.`);
      }
    }

    // Check max water count
    if (this.props.waterCount >= Tree.MAX_WATER_COUNT) {
      throw new Error('Tree has reached maximum water count');
    }

    this.props.waterCount += 1;
    this.props.lastWatered = new Date();
    this.updateStatus();
    this.props.updatedAt = new Date();
  }

  public updateHeight(height: number): void {
    if (height < 0) {
      throw new Error('Height cannot be negative');
    }
    this.props.height = height;
    this.props.updatedAt = new Date();
  }

  public updateImage(imageUrl: string): void {
    this.props.image = imageUrl;
    this.props.updatedAt = new Date();
  }

  public markAsAtRisk(): void {
    this.props.status = TreeStatus.AtRisk;
    this.props.updatedAt = new Date();
  }

  private updateStatus(): void {
    const daysSinceWater = this.props.lastWatered
      ? (new Date().getTime() - this.props.lastWatered.getTime()) / (1000 * 60 * 60 * 24)
      : this.ageDays;

    if (daysSinceWater > 7) {
      this.props.status = TreeStatus.AtRisk;
    } else if (daysSinceWater > 3) {
      this.props.status = TreeStatus.NeedsWater;
    } else {
      this.props.status = TreeStatus.Healthy;
    }
  }

  public canBeWatered(): boolean {
    if (!this.props.lastWatered) return true;

    const hoursSinceLastWater =
      (new Date().getTime() - this.props.lastWatered.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastWater >= Tree.WATER_COOLDOWN_HOURS;
  }

  public isOwnedBy(userId: string): boolean {
    return this.props.plantedBy === userId;
  }
}
