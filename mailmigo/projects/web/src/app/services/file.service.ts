import { Injectable } from "@angular/core";
import { Option } from "@shared/types/rust/option";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class FileService {
  current: Option<{
    path: string;
    data: Blob;
    meta?: object;
  }> = Option.None();

  constructor(private storage: StorageService) {}

  async setFile(path: string): Promise<boolean> {
    try {
      const blob = await this.storage.getBlob(path);
      const meta = await this.storage.getMeta(path);
      this.current = Option.Some({ path, data: blob, meta });
      return true;
    } catch {
      return false;
    }
  }

  async downloadFile(path: string): Promise<void> {
    try {
      const blob = await this.storage.getBlob(path);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
}
