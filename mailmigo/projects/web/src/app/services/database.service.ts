import { Injectable, Signal, computed } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { inject } from "@angular/core";
import {
  Database,
  TransactionResult,
  connectDatabaseEmulator,
  ref,
  objectVal,
  set,
  update,
  remove,
  Query,
  push,
  onValue,
} from "@angular/fire/database";
import { runTransaction, Unsubscribe } from '@angular/fire/database';
import environment from '@environments/environment';
import { EnvironmentType } from '@environments/types';
import { Option } from '@shared/types/rust/option';
// @ts-ignore
import { DataSnapshot } from '@angular/fire/compat/database/interfaces';

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private database = inject(Database);

  constructor () {
    if (environment.type == EnvironmentType.LOCAL) {
      // Point to the RTDB emulator running on localhost.
      connectDatabaseEmulator(this.database, "127.0.0.1", 9000);
    }
  }

  // Used if want to handle undefined case while fetching.
  public observe<T extends string | number | boolean | object> (
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
  public observeWithInitial<T extends string | number | boolean | object> (
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

  public observeQueryWithInitial<T extends string | number | boolean | object>(
    query: Query,
    initialValue: T,
  ): Signal<T> {
    const obs$ = objectVal<T>(query);
    const signal = toSignal<T>(obs$);
    return computed(() =>
      signal() !== undefined ? (signal() as T) : initialValue,
    );
  }

  // Used if want to listen to value.
  // Note: if pushing using pushWithId(), this will fire twice: once when the empty object is pushed, and once when its id is set.
  public subscribeToPath (
    path: string,
    callback: (snapshot: DataSnapshot) => void,
  ): Unsubscribe {
    const dbRef = ref(this.database, path);
    return onValue(dbRef, (snapshot) => callback(snapshot));
  }

  public transact<T extends string | number | boolean | object> (
    path: string,
    transaction: (currentData: T) => T,
  ): Promise<TransactionResult> {
    const dbRef = ref(this.database, path);
    return runTransaction(dbRef, transaction);
  }

  // Set data at `path`
  public set<T extends string | number | boolean | object>(
    path: string,
    data: T,
  ): Promise<void> {
    const dbRef = ref(this.database, path);
    return set(dbRef, data);
  }

  // Push data to new key at `path`
  public async push<T extends object> (
    path: string,
    data: T,
  ) {
    const dbRef = ref(this.database, path);
    try {
      const pushed = await push(dbRef);
      const payload = {...data, id: pushed.key};
      return await set(pushed, payload);
    } catch (e) {
        console.log(e);
    }
  }

  // Update data at `path`
  public update<T extends object>(path: string, data: T): Promise<void> {
    const dbRef = ref(this.database, path);
    return update(dbRef, data);
  }

  // Remove the data at `path`.
  public remove(path: string): Promise<void> {
    const dbRef = ref(this.database, path);
    return remove(dbRef);
  }
}
