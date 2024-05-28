import { Injectable, Signal } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  count: Signal<number | undefined>;
  countWithInitial: Signal<number>;

  constructor(private db: DatabaseService) {
    this.count = db.observe<number>('count');
    this.countWithInitial = db.observeWithInitial<number>('count', 0);
  }

  public addToCount() {
    this.db.transact<number>('count', (current) => current + 1);
  }
}
