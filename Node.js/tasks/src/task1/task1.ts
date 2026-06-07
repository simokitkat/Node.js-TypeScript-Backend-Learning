import EventEmitter from "node:events";
import crypto from "node:crypto";

import { Message, MessageType, UserEventType } from "./types";

export class MessageSystem extends EventEmitter {
  private users = new Set<string>();
  private messages: Message[] = [];

  constructor() {
    super();
  }

  addUser(userName: string) {
    this.users.add(userName);
    this.emit("user-joined", userName);
  }

  removeUser(userName: string) {
    this.users.delete(userName);
    this.emit("user-left", userName);
  }

  getUserCount() {
    return this.users.size;
  }

  getActiveUsers() {
    return Array.from(this.users);
  }

  sendMessage(type: MessageType, content: string, sender?: string) {
    const message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
      sender,
    };

    this.messages.push(message);
    this.emit(type, message);
  }

  subscribeToType(type: MessageType, callback: (msg: Message) => void) {
    this.on(type, callback);
  }

  subscribeToMessages(
    type: MessageType | UserEventType,
    callback: (msg: Message) => void,
  ) {
    this.on(type, callback);
  }

  getMessageHistory() {
    const last10 = this.messages.slice(-10);
    return last10;
  }

  clearHistory() {
    this.messages = [];
  }

  getStats() {
    return {
      messageCount: this.messages.length,
      userCount: this.users.size,
    };
  }
}

console.log("Task 1..");
