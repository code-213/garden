
export class ImageUrl {
  private readonly value: string;

  private constructor(url: string) {
    this.value = url;
  }

  public static create(url: string): ImageUrl {
    if (!ImageUrl.isValid(url)) {
      throw new Error('Invalid image URL');
    }
    return new ImageUrl(url);
  }

  private static isValid(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      const hasValidProtocol = validProtocols.includes(urlObj.protocol);
      const hasValidExtension = validExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );
      
      return hasValidProtocol && (hasValidExtension || urlObj.hostname.includes('cloudinary'));
    } catch {
      return false;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ImageUrl): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}