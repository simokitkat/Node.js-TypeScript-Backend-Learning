import { MessageSystem } from "./task1";

const chat = new MessageSystem();

// 1. Subscribe to alerts
chat.subscribeToType("alert", (msg) => {
  console.log(`🚨 ALERT: ${msg.content} (from ${msg.sender})`);
});

chat.subscribeToType("message", (msg) => {
  console.log(`💬 MESSAGE: ${msg.content} (from ${msg.sender})`);
});

chat.subscribeToType("notification", (msg) => {
  console.log(`📢 NOTIFICATION: ${msg.content} (from ${msg.sender})`);
});

// 2. Subscribe to ALL messages
chat.subscribeToMessages((msg) => {
  console.log(`📨 NEW: [${msg.type}] ${msg.content}`);
});

// 3. Test invalid user
console.log("\n--- Testing invalid user ---");
chat.sendMessage("message", "Hello?", "Ghost"); // Should trigger alert, NOT add to history

// 4. Test valid users
console.log("\n--- Testing valid users ---");
chat.addUser("Alice");
chat.addUser("Bob");

chat.sendMessage("message", "Hi everyone!", "Alice");
chat.sendMessage("notification", "System maintenance at 5 PM", "Bob");
chat.sendMessage("alert", "Server is down!", "Bob");

// 5. Check stats and history
console.log("\n--- Stats & History ---");
console.log("Stats:", chat.getStats());
console.log("History:", chat.getMessageHistory());
