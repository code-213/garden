import { Entity } from './base/Entity';
import { Location } from '../value-objects/Location';

export type FireSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FireStatus = 'pending' | 'investigating' | 'resolved' | 'false_alarm';

export interface FireProps {
  reportedBy: string; // User ID
  location: Location;
  severity: FireSeverity;
  status: FireStatus;
  description: string;
  reportedDate: Date;
  updatedDate: Date;
  images: string[];
  affectedAreaSqm?: number;
  responseTeam?: string;
  resolvedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Fire extends Entity<FireProps> {
  private constructor(props: FireProps, id?: string) {
    super(props, id);
  }

  public static create(props: FireProps, id?: string): Fire {
    return new Fire(props, id);
  }

  // Getters
  get reportedBy(): string {
    return this.props.reportedBy;
  }

  get location(): Location {
    return this.props.location;
  }

  get severity(): FireSeverity {
    return this.props.severity;
  }

  get status(): FireStatus {
    return this.props.status;
  }

  get description(): string {
    return this.props.description;
  }

  get reportedDate(): Date {
    return this.props.reportedDate;
  }

  get updatedDate(): Date {
    return this.props.updatedDate;
  }

  get images(): string[] {
    return this.props.images;
  }

  get affectedAreaSqm(): number | undefined {
    return this.props.affectedAreaSqm;
  }

  get responseTeam(): string | undefined {
    return this.props.responseTeam;
  }

  get resolvedDate(): Date | undefined {
    return this.props.resolvedDate;
  }

  // Business Methods
  public updateStatus(newStatus: FireStatus, notes?: string): void {
    const validTransitions: Record<FireStatus, FireStatus[]> = {
      pending: ['investigating', 'false_alarm'],
      investigating: ['resolved', 'false_alarm'],
      resolved: [],
      false_alarm: []
    };

    if (!validTransitions[this.props.status].includes(newStatus)) {
      throw new Error(`Cannot transition from ${this.props.status} to ${newStatus}`);
    }

    this.props.status = newStatus;
    if (notes) this.props.notes = notes;
    this.props.updatedDate = new Date();

    if (newStatus === 'resolved') {
      this.props.resolvedDate = new Date();
    }
  }

  public assignResponseTeam(teamName: string): void {
    if (this.props.status === 'resolved' || this.props.status === 'false_alarm') {
      throw new Error('Cannot assign team to resolved or false alarm fires');
    }

    this.props.responseTeam = teamName;
    this.props.updatedAt = new Date();
  }

  public updateAffectedArea(areaSqm: number): void {
    if (areaSqm < 0) {
      throw new Error('Affected area cannot be negative');
    }
    this.props.affectedAreaSqm = areaSqm;
    this.props.updatedDate = new Date();
  }

  public addImage(imageUrl: string): void {
    this.props.images.push(imageUrl);
    this.props.updatedDate = new Date();
  }

  public isPending(): boolean {
    return this.props.status === 'pending';
  }

  public isResolved(): boolean {
    return this.props.status === 'resolved';
  }

  public isCritical(): boolean {
    return this.props.severity === 'critical';
  }

  public isReportedBy(userId: string): boolean {
    return this.props.reportedBy === userId;
  }
}
