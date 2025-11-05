export interface PlantTreeRequestDTO {
  species: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: string;
  notes?: string;
}

export interface TreeResponseDTO {
  id: string;
  species: string;
  plantedBy: string;
  plantedDate: Date;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: string;
  waterCount: number;
  lastWatered?: Date;
  image?: string;
  ageDays: number;
}
