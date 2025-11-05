export interface IImageStorage {
  uploadImage(file: Buffer, folder: string): Promise<string>;
  deleteImage(url: string): Promise<void>;
  getImageUrl(publicId: string): string;
}
