import { Component, Input } from '@angular/core';

@Component({
  selector: 'home-greeting',
  standalone: true,
  imports: [],
  templateUrl: './greeting.component.html',
  styles: ``,
})
export class GreetingComponent {
  @Input({ required: true }) message: string = '';
}
