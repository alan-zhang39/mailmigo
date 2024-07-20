import { Injectable, Signal, computed } from "@angular/core";
import { inject } from "@angular/core";
import {
  Database,
  connectDatabaseEmulator,
  ref,
  query,
  orderByChild,
  limitToLast,
  startAfter,
  equalTo,
  get,
  objectVal
} from "@angular/fire/database";
import environment from '@environments/environment';
import { EnvironmentType } from '@environments/types';
import { AuthService } from "./auth.service";
import { signal } from "@angular/core";
import { Task } from "../../../../shared/index";
import { Option } from "../../../../shared/index";
import { toSignal } from "@angular/core/rxjs-interop";
// @ts-ignore

@Injectable({
  providedIn: 'root'
})
export class GenerationsService {
  private database = inject(Database);
  private auth = inject(AuthService);

  constructor() {
    if (environment.type == EnvironmentType.LOCAL) {
      connectDatabaseEmulator(this.database, "127.0.0.1", 9000);
    }
  }

  /* DOES NOT WORK! firebase doesn't allow usage of both equalTo and startAfter - workaround would be to nest tasks inside uid but for now not using this */
  paginateTasks(limit: number, startAfterKey: string | null = null): Signal<Option<{ [key: string]: Task }>> {
    const uid = this.auth.user()?.uid;
    if (!uid) return signal(Option.None<{ [key: string]: Task }>());

    let q = query(
      ref(this.database, `tasks`),
      orderByChild('uid'),
      equalTo(uid),
      limitToLast(limit)
    );

    if (startAfterKey) {
      q = query(q, startAfter(startAfterKey));
    }

    const obs$ = objectVal<{ [key: string]: Task }>(q);
    const signalObs = toSignal<{ [key: string]: Task }>(obs$);

    return computed(() =>
      signalObs() !== undefined ? Option.Some(signalObs() as { [key: string]: Task }) : Option.None<{ [key: string]: Task }>(),
    );
  }
}