export type MessageType = "message" | "notification" | "alert";

export type UserEventType = "user-joined" | "user-left";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  sender?: string;
}
