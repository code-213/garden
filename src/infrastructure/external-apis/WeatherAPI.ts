import axios from 'axios';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  fireRisk: 'low' | 'medium' | 'high' | 'extreme';
}

export class WeatherAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getWeatherByCoordinates(lat: number, lng: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      const fireRisk = this.calculateFireRisk(data.main.temp, data.main.humidity, data.wind.speed);

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        conditions: data.weather[0].description,
        fireRisk
      };
    } catch (error) {
      throw new Error('Failed to fetch weather data');
    }
  }

  private calculateFireRisk(
    temp: number,
    humidity: number,
    windSpeed: number
  ): WeatherData['fireRisk'] {
    let riskScore = 0;

    // High temperature increases risk
    if (temp > 30) riskScore += 3;
    else if (temp > 25) riskScore += 2;
    else if (temp > 20) riskScore += 1;

    // Low humidity increases risk
    if (humidity < 30) riskScore += 3;
    else if (humidity < 50) riskScore += 2;
    else if (humidity < 70) riskScore += 1;

    // High wind speed increases risk
    if (windSpeed > 20) riskScore += 3;
    else if (windSpeed > 15) riskScore += 2;
    else if (windSpeed > 10) riskScore += 1;

    if (riskScore >= 7) return 'extreme';
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }
}
