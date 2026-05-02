const EventEmitter = require("node:events");

const event = new EventEmitter();

event.on("hi-mom", () => {
  console.log("hi mom");
});

event.emit("hi-mom");
