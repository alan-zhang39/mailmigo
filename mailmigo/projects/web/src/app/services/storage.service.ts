import { Injectable, inject } from "@angular/core";
import {
  Storage,
  connectStorageEmulator,
  deleteObject,
  getBlob,
  getMetadata,
  ref,
  uploadBytes,
} from "@angular/fire/storage";
import environment from "@environments/environment";
import { EnvironmentType } from "@environments/types";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private storage = inject(Storage);

  constructor() {
    if (environment.type == EnvironmentType.LOCAL) {
      // Point to the storage emulator running on localhost.
      connectStorageEmulator(this.storage, "127.0.0.1", 9199);
    }
  }

  async getBlob(path: string) {
    const r = ref(this.storage, path);
    return getBlob(r);
  }

  async getMeta(path: string) {
    const r = ref(this.storage, path);
    return getMetadata(r);
  }

  async uploadBytes(path: string, data: Blob | Uint8Array | ArrayBuffer) {
    const r = ref(this.storage, path);
    return uploadBytes(r, data);
  }

  // `path` must be a file. deleteObject will throw an error if called on a directory.
  async deleteObject(path: string) {
    const r = ref(this.storage, path);
    return deleteObject(r);
  }
}
