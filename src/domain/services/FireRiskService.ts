import { Fire } from '../entities/Fire';

export class FireRiskService {
  static calculateRiskScore(fire: Fire): number {
    let score = 0;

    // Base score by severity
    const severityScores = {
      low: 25,
      medium: 50,
      high: 75,
      critical: 100
    };
    score += severityScores[fire.severity];

    // Increase if unresolved
    if (fire.status === 'pending' || fire.status === 'investigating') {
      score += 20;
    }

    // Increase based on affected area
    if (fire.affectedAreaSqm) {
      score += Math.min(fire.affectedAreaSqm / 1000, 30);
    }

    return Math.min(100, score);
  }

  static isHighRisk(fire: Fire): boolean {
    return this.calculateRiskScore(fire) >= 70;
  }

  static areNearby(fire1: Fire, fire2: Fire, radiusKm: number = 10): boolean {
    const distance = fire1.location.distanceTo(fire2.location);
    return distance <= radiusKm;
  }
}
