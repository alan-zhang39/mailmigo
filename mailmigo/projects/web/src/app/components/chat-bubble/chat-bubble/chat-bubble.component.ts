import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { DateService } from 'src/app/services/date.service';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [
    NgClass,
  ],
  templateUrl: './chat-bubble.component.html',
  styles: ``
})
export class ChatBubbleComponent {
  constructor(public dateService: DateService) { }
  @Input() isResponse: boolean = false;
  @Input() message: string = '';
  @Input() timestamp: number = 0;
}
