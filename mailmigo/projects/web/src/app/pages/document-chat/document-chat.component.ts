import { Component, ChangeDetectorRef, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { DocumentChatService } from '@services/document-chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBubbleComponent } from '@components/chat-bubble/chat-bubble/chat-bubble.component';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { StyleClassModule } from 'primeng/styleclass';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { DateService } from '@services/date.service';
import { debounce } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatBubbleComponent, InputTextModule, IconFieldModule, InputIconModule, StyleClassModule, ToolbarModule, BreadcrumbModule],
  templateUrl: './document-chat.component.html',
  styles: ``
})
export class DocumentChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  protected breadcrumbs: MenuItem[];
  protected currentMessage: string = '';
  // ms
  private readonly DEBOUNCE_TIME: number = 75;
  
  protected onScroll = debounce(() => {
    // Check if we reached the top of the chat messages
    // Scroll height is negative as our container is flex-col-reverse
    const el: HTMLElement = this.messageContainer.nativeElement;
    if (el.scrollTop + (el.scrollHeight - el.clientHeight) < 1) {
      this.chatService.loadOldMessages();
    }
  }, this.DEBOUNCE_TIME);
  
  private messageSend: Subscription | undefined;

  constructor (public chatService: DocumentChatService, public dateService: DateService, private cdref: ChangeDetectorRef) {
    // get breadcrumbs here.
    this.breadcrumbs = [];
    this.breadcrumbs.push({ icon: 'pi-home' });
    // Route to relevant document page
    this.breadcrumbs.push({ label: 'Document.pdf' });
  }

  ngOnInit (): void {
    this.messageSend = this.chatService.getMessageSend$().subscribe(() => {
      this.scrollToBottom();
    });
  }

  ngOnDestroy (): void {
    if (typeof this.messageSend === 'undefined') { return; }
    this.messageSend.unsubscribe();
  }

  // need this or else ExpressionChangedAfterItHasBeenCheckedError when autoscrolling to bottom after new message
  ngAfterContentChecked () {
    this.cdref.detectChanges();
  }

  protected scrollToBottom (): void {
    try {
      console.log(this.messageContainer.nativeElement.scrollTop, this.messageContainer.nativeElement.scrollHeight);
      this.messageContainer.nativeElement.scrollTop = 0;
    } catch (err) { }
  }

  protected onSubmit = () => {
    this.chatService.addMessage(this.currentMessage);
    this.currentMessage = '';
  };
}
