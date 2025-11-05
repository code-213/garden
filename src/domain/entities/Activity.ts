import { Entity } from './base/Entity';

export type ActivityType = 'tree_planted' | 'tree_watered' | 'fire_reported' | 'profile_updated';

export interface ActivityProps {
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class Activity extends Entity<ActivityProps> {
  private constructor(props: ActivityProps, id?: string) {
    super(props, id);
  }

  public static create(props: ActivityProps, id?: string): Activity {
    return new Activity(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): ActivityType {
    return this.props.type;
  }

  get description(): string {
    return this.props.description;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  public isRecent(hours: number = 24): boolean {
    const now = new Date();
    const hoursDiff = (now.getTime() - this.props.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= hours;
  }
}
