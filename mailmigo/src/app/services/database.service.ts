import { Injectable, Signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import {
  Database,
  TransactionResult,
  objectVal,
  ref,
} from '@angular/fire/database';

import { runTransaction } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private database = inject(Database);

  constructor() { }

  // Used if want to handle undefined case while fetching.
  public observe<T extends string | number | boolean | object>(
    path: string,
  ): Signal<T | undefined> {
    const dbRef = ref(this.database, path);
    const obs$ = objectVal<T>(dbRef);
    const signal = toSignal<T>(obs$);
    return signal;
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
