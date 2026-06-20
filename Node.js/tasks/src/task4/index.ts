import { TodoServer } from "./todo-server";

const server = new TodoServer(3000);
server.start();
