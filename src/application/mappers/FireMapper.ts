import { Fire } from '@domain/entities/Fire';

export interface FireResponseDTO {
  id: string;
  reportedBy: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  severity: string;
  status: string;
  description: string;
  reportedDate: string;
  updatedDate: string;
  resolvedDate: string | null;
  images: string[];
  affectedAreaSqm: number | null;
  responseTeam: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export class FireMapper {
  static toDTO(fire: Fire): FireResponseDTO {
    return {
      id: fire.id,
      reportedBy: fire.reportedBy,
      location: fire.location.toJSON(),
      severity: fire.severity,
      status: fire.status,
      description: fire.description,
      reportedDate: fire.reportedDate.toISOString(),
      updatedDate: fire.updatedDate.toISOString(),
      resolvedDate: fire.resolvedDate?.toISOString() || null,
      images: fire.images,
      affectedAreaSqm: fire.affectedAreaSqm || null,
      responseTeam: fire.responseTeam || null,
      notes: fire.notes || null,
      createdAt: fire.createdAt.toISOString(),
      updatedAt: fire.updatedAt.toISOString()
    };
  }

  static toListDTO(fires: Fire[]): FireResponseDTO[] {
    return fires.map(fire => this.toDTO(fire));
  }
}
