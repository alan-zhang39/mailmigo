import { GenerationType } from "./generation";

export enum TaskStatus {
  UPLOADING = "uploading",
  TRANSCRIBING = "transcribing",
  GENERATING = "generating",
  FAILED = "failed",
  COMPLETE = "complete",
}

export interface Task {
  id: string;
  type: GenerationType;
  status: TaskStatus;
  documentId: string;
  documentName: string;
  uid: string;
  orgId: string;
  origin?: {
    threadId: string;
    from: string;
    to: string;
    emailId: string;
  };
  timestamp: number;
}
