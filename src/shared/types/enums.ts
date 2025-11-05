export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

export enum TreeStatusEnum {
  HEALTHY = 'healthy',
  NEEDS_WATER = 'needs_water',
  AT_RISK = 'at_risk'
}

export enum FireSeverityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum FireStatusEnum {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm'
}
