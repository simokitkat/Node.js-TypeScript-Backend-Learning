import EventEmitter from "node:events";
import crypto from "node:crypto";
import { Message, MessageType } from "./types";

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

  sendMessage(type: MessageType, content: string, sender: string) {
    if (!this.users.has(sender)) {
      const alertMsg: Message = {
        id: crypto.randomUUID(),
        type: "alert",
        content: "Please join the chat first",
        timestamp: new Date(),
        sender,
      };

      this.emit("alert", alertMsg);

      return;
    }

    const message: Message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
      sender,
    };

    this.messages.push(message);

    this.emit(type, message);
    this.emit("new-message", message);
  }

  subscribeToType(type: MessageType, callback: (msg: Message) => void) {
    this.on(type, callback);
  }

  subscribeToMessages(callback: (msg: Message) => void) {
    this.on("new-message", callback);
  }

  getMessageHistory() {
    return this.messages.slice(-10);
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
