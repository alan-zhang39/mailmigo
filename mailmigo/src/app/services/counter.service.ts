import { Injectable, Signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { Option } from '@shared/types/rust/option';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  count: Signal<Option<number>>;
  countWithInitial: Signal<number>;

  constructor(private db: DatabaseService) {
    this.count = db.observe<number>('count');
    this.countWithInitial = db.observeWithInitial<number>('count', 0);
  }

  /* Create click callback.
   * NOTE: If a function satisfies both of these conditions:
   *  1. Function is passed to a child component (in this case app-button)
   *  2. Function uses 'this' during its execution.
   * Then it MUST be declared as a arrow function, NOT as a method on the service class.
   * - This is because regular functions create a new context, so within them 'this' refers to something else after being passed down.
   * - However, arrow functions retain whatever bindings they were created with. So 'this' stays consistent.
   */
  public addToCount = () => {
    this.db.transact<number>('count', (current) => current + 1);
  };
}
