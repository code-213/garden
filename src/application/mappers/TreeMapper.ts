import { Tree } from '@domain/entities/Tree';

export interface TreeResponseDTO {
  id: string;
  species: string;
  plantedBy: string;
  plantedDate: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: string;
  waterCount: number;
  lastWatered: string | null;
  image: string | null;
  notes: string | null;
  ageDays: number;
  createdAt: string;
  updatedAt: string;
}

export class TreeMapper {
  static toDTO(tree: Tree): TreeResponseDTO {
    return {
      id: tree.id,
      species: tree.species,
      plantedBy: tree.plantedBy,
      plantedDate: tree.plantedDate.toISOString(),
      location: tree.location.toJSON(),
      status: tree.status,
      waterCount: tree.waterCount,
      lastWatered: tree.lastWatered?.toISOString() || null,
      image: tree.image || null,
      notes: tree.notes || null,
      ageDays: tree.ageDays,
      createdAt: tree.createdAt.toISOString(),
      updatedAt: tree.updatedAt.toISOString()
    };
  }

  static toListDTO(trees: Tree[]): TreeResponseDTO[] {
    return trees.map(tree => this.toDTO(tree));
  }
}
