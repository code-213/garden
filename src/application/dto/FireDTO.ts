export interface ReportFireRequestDTO {
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  images?: string[];
  affectedAreaSqm?: number;
}

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
  reportedDate: Date;
  images: string[];
  affectedAreaSqm?: number;
}
