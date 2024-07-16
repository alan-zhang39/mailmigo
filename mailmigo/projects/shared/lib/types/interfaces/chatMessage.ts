export interface ChatMessage {
  id: string;
  documentId: string;
  content: string;
  timestamp: number;
  isResponse: boolean; //ie, user-sent message is not a response
}
