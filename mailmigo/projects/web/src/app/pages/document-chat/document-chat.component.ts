import { Component } from '@angular/core';
import { DocumentChatService } from '@services/document-chat.service'
import { CounterService } from '@services/counter.service'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-chat.component.html',
  styles: ``
})
export class DocumentChatComponent {

  constructor(public chatService: DocumentChatService) { }

  protected readonly JSON = JSON;
}
