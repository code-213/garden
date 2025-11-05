export enum TreeStatus {
  Healthy = 'healthy',
  NeedsWater = 'needs_water',
  AtRisk = 'at_risk'
}

export class TreeStatusVO {
  private readonly value: TreeStatus;

  private constructor(status: TreeStatus) {
    this.value = status;
  }

  public static create(status: string): TreeStatusVO {
    const validStatuses = Object.values(TreeStatus);
    if (!validStatuses.includes(status as TreeStatus)) {
      throw new Error(`Invalid tree status: ${status}`);
    }
    return new TreeStatusVO(status as TreeStatus);
  }

  public static healthy(): TreeStatusVO {
    return new TreeStatusVO(TreeStatus.Healthy);
  }

  public static needsWater(): TreeStatusVO {
    return new TreeStatusVO(TreeStatus.NeedsWater);
  }

  public static atRisk(): TreeStatusVO {
    return new TreeStatusVO(TreeStatus.AtRisk);
  }

  public getValue(): TreeStatus {
    return this.value;
  }

  public isHealthy(): boolean {
    return this.value === TreeStatus.Healthy;
  }

  public needsAttention(): boolean {
    return this.value === TreeStatus.NeedsWater || this.value === TreeStatus.AtRisk;
  }

  public equals(other: TreeStatusVO): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
