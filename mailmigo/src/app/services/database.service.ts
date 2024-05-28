import { Injectable, Signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import {
  Database,
  TransactionResult,
  connectDatabaseEmulator,
  objectVal,
  ref,
} from '@angular/fire/database';

import { runTransaction } from '@angular/fire/database';
import { Option } from '@shared/types/rust/option';
import environment from '@environment';
import { EnvironmentType } from 'src/environments/types';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private database = inject(Database);

  constructor() {
    if (environment.type == EnvironmentType.LOCAL) {
      // Point to the RTDB emulator running on localhost.
      connectDatabaseEmulator(this.database, '127.0.0.1', 9000);
    }
  }

  // Used if want to handle undefined case while fetching.
  public observe<T extends string | number | boolean | object>(
    path: string,
  ): Signal<Option<T>> {
    const dbRef = ref(this.database, path);
    const obs$ = objectVal<T>(dbRef);
    const signal = toSignal<T>(obs$);
    return computed(() =>
      signal() !== undefined ? Option.Some(signal() as T) : Option.None(),
    );
  }

  // Used if want to handle given initial value while fetching.
  public observeWithInitial<T extends string | number | boolean | object>(
    path: string,
    initialValue: T,
  ): Signal<T> {
    const dbRef = ref(this.database, path);
    const obs$ = objectVal<T>(dbRef);
    const signal = toSignal<T>(obs$);
    return computed(() =>
      signal() !== undefined ? (signal() as T) : initialValue,
    );
  }

  public transact<T extends string | number | boolean | object>(
    path: string,
    transaction: (currentData: T) => T,
  ): Promise<TransactionResult> {
    const dbRef = ref(this.database, path);
    return runTransaction(dbRef, transaction);
  }
}
