import { Injectable, } from '@angular/core';
import { DatabaseService } from './database.service';
import {
  Database,
  endBefore,
  getDatabase,
  limitToLast,
  orderByChild,
  query,
  ref,
} from '@angular/fire/database';
import { ChatMessage } from '@shared/types/interfaces/chatMessage';
// @ts-ignore
import { DataSnapshot } from '@angular/fire/compat/database/interfaces';
import { Yallist } from '@shared/yallist/src';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentChatService {

  // linked list.
  // use linked list bc we need both prepend/append (loading older and new messages).
  public chatMessages = new Yallist<ChatMessage>();
  public aiTyping: boolean = false;
  private readonly CHAT_MESSAGE_LIMIT: number = 50;
  private db2 = getDatabase();
  
  private messageSend$: Subject<void> = new Subject<void>();
  
  // timestamp of latest message we've loaded
  private messageOffset;

  constructor (private db: DatabaseService) {
    this.messageOffset = Math.floor(Date.now() / 1000);
    this.loadMessages();
  }

  public addMessage = (message: string) => {
    // Validate form input here instead of on form because we don't want the red outline on ng-invalid for the inputText component

    // Checks if message is empty or only whitespace
    if (!message.trim()) { return; }
    const chatMessage: ChatMessage = {
      id: 'temp',
      documentId: '1',
      content: message,
      timestamp: Math.floor(Date.now() / 1000),
      isResponse: false,
    };
    this.db.push('chatMessages/1', chatMessage);
  };

  // we only get 1 new message at a time
  public onNewMessage = (snapshot: DataSnapshot) => {
    console.log("trig");
    const val = snapshot.val();

    //From push with id
    if (val === undefined || val === null || val === '') return;
    this.chatMessages.unshift(val);
    this.aiTyping = !val.isResponse;
    if (val.timestamp < this.messageOffset) {
      this.messageOffset = val.timestamp;
    }
    this.messageSend$.next();
  };
  
  public onOldMessage = (snapshot: DataSnapshot) => {
    const val = snapshot.val();
    if (val === undefined || val === null || val === '') return;
    const keys = Object.keys(val);
    for(let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      this.chatMessages.push(val[key]);
      if (val[key].timestamp < this.messageOffset) {
        this.messageOffset = val[key].timestamp;
      }
    }
  }
  
  // load messages on page load. also loads new messages as they arrive.
  public loadMessages = () => {
    const q = query(this.getRef(this.db2), limitToLast(this.CHAT_MESSAGE_LIMIT), orderByChild('timestamp'));
    this.db.subscribeChildAdded(this.onNewMessage, q);
    this.db.subscribeChildChanged(this.onNewMessage, q);
  };
  
  public loadOldMessages = () => {
    const q = query(this.getRef(this.db2), limitToLast(this.CHAT_MESSAGE_LIMIT), orderByChild('timestamp'), endBefore(this.messageOffset));
    this.db.subscribeOnValue(this.onOldMessage, q);
  }

  public getChatMessageCount = (): number => {
    return this.chatMessages.length - 1;
  };
  
  private getRef = (db: Database) => {
    return ref(db, 'chatMessages/1');
  }
  
  // have getter for this as it doesn't get called in the template
  public getMessageSend$() {
    return this.messageSend$.asObservable();
  }
}