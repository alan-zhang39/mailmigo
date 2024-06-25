import { Injectable, inject } from '@angular/core';
import { Storage, connectStorageEmulator } from '@angular/fire/storage';
import environment from '@environments/environment';
import { EnvironmentType } from '@environments/types';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = inject(Storage);

  constructor() {
    if (environment.type == EnvironmentType.LOCAL) {
      // Point to the storage emulator running on localhost.
      connectStorageEmulator(this.storage, '127.0.0.1', 9199);
    }
  }
}
