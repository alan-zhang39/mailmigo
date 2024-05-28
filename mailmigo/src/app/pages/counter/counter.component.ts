import { Component, effect } from '@angular/core';
import { CounterService } from '../../services/counter.service';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [],
  templateUrl: './counter.component.html',
  styles: ``,
})
export class CounterComponent {
  constructor(public countService: CounterService) { }
}
