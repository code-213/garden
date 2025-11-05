import axios from 'axios';

export interface PlantInfo {
  scientificName: string;
  commonName: string;
  family: string;
  imageUrl?: string;
  description?: string;
}

export class TrefleAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://trefle.io/api/v1';
  }

  async searchPlant(query: string): Promise<PlantInfo[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/plants/search`, {
        params: {
          token: this.apiKey,
          q: query
        }
      });

      return response.data.data.map((plant: any) => ({
        scientificName: plant.scientific_name,
        commonName: plant.common_name,
        family: plant.family,
        imageUrl: plant.image_url,
        description: plant.description
      }));
    } catch (error) {
      throw new Error('Failed to fetch plant information');
    }
  }

  async getPlantById(id: number): Promise<PlantInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/plants/${id}`, {
        params: {
          token: this.apiKey
        }
      });

      const plant = response.data.data;
      return {
        scientificName: plant.scientific_name,
        commonName: plant.common_name,
        family: plant.family,
        imageUrl: plant.image_url,
        description: plant.description
      };
    } catch (error) {
      throw new Error('Failed to fetch plant information');
    }
  }
}
