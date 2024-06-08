import { Component, effect } from '@angular/core';
import { ButtonComponent } from '@components/button/button.component';
import { CounterService } from '@services/counter.service';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './counter.component.html',
  styles: ``,
})
export class CounterComponent {
  constructor(public countService: CounterService) { }
}
