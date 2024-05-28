import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styles: ``,
})
export class ButtonComponent {
  @Input({ required: true }) text: string = '';
  @Input({ required: true }) callback: (() => void) | null = null;

  public click() {
    if (this.callback !== null) this.callback();
  }
}
