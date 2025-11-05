export interface IStorageService {
  uploadImage(file: Buffer, folder: string): Promise<string>;
  deleteImage(url: string): Promise<void>;
}