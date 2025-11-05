import { Tree } from '../entities/Tree';

export class TreeDomainService {
  static calculateHealthScore(tree: Tree): number {
    let score = 100;

    // Deduct points based on status
    if (tree.status === 'needs_water') score -= 20;
    if (tree.status === 'at_risk') score -= 50;

    // Add points for regular watering
    if (tree.waterCount > 0) {
      score += Math.min(tree.waterCount * 0.5, 20);
    }

    return Math.max(0, Math.min(100, score));
  }

  static isNearby(tree1: Tree, tree2: Tree, radiusKm: number = 1): boolean {
    const distance = tree1.location.distanceTo(tree2.location);
    return distance <= radiusKm;
  }

  static findNearbyTrees(tree: Tree, allTrees: Tree[], radiusKm: number = 5): Tree[] {
    return allTrees.filter(t => t.id !== tree.id && this.isNearby(tree, t, radiusKm));
  }
}
