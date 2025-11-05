export interface LocationProps {
  lat: number;
  lng: number;
  address?: string;
}

export class Location {
  private readonly lat: number;
  private readonly lng: number;
  private readonly address?: string;

  private constructor(props: LocationProps) {
    this.lat = props.lat;
    this.lng = props.lng;
    this.address = props.address;
  }

  public static create(props: LocationProps): Location {
    // Validate latitude
    if (props.lat < -90 || props.lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    // Validate longitude
    if (props.lng < -180 || props.lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    return new Location(props);
  }

  public getLatitude(): number {
    return this.lat;
  }

  public getLongitude(): number {
    return this.lng;
  }

  public getAddress(): string | undefined {
    return this.address;
  }

  public distanceTo(other: Location): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(other.lat - this.lat);
    const dLng = this.toRadians(other.lng - this.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.lat)) *
        Math.cos(this.toRadians(other.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  public equals(other: Location): boolean {
    return this.lat === other.lat && this.lng === other.lng;
  }

  public toJSON(): LocationProps {
    return {
      lat: this.lat,
      lng: this.lng,
      address: this.address
    };
  }
}
