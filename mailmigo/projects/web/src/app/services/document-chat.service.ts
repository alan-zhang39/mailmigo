import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { HttpClient } from '@angular/common/http';
import { Config } from '@angular/fire/auth';
import { Unsubscribe } from '@angular/fire/database';
import { ChatMessage } from '@shared/types/interfaces/chatMessage';
// @ts-ignore
import { DataSnapshot } from '@angular/fire/compat/database/interfaces';

@Injectable({
  providedIn: 'root',
})
export class DocumentChatService {
  public currentMessage: string;
  private unsubscribe: Unsubscribe;
  private chatMessagesSnapshot: DataSnapshot;

  constructor (private db: DatabaseService, private http: HttpClient) {
    this.unsubscribe = this.db.subscribeToPath('chatMessages/1', this.refresh);
    this.currentMessage = '';
  }

  public addMessage = () => {
    const chatMessage: ChatMessage = {
      id: 'temp',
      documentId: '1',
      content: this.currentMessage,
      timestamp: Math.floor(Date.now() / 1000),
      isResponse: false,
    };
    this.db.push('chatMessages/1', chatMessage);
  };

  public refresh = (snapshot: DataSnapshot) => {
    this.chatMessagesSnapshot = snapshot;
  };

  // TODO: pagination
  // extracts chat messages from the DataSnapshot
  public getChatMessages = (): ChatMessage[] => {
    const chatMessages: ChatMessage[] = [];
    if (this.chatMessagesSnapshot === undefined) { return chatMessages; }
    for (const chatMessage in this.chatMessagesSnapshot.val()) {
      chatMessages.push(this.chatMessagesSnapshot.val()[chatMessage]);
    }
    return chatMessages;
  };
}