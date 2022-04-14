import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
if (process.env.REACT_APP_API_URL) {
  socket = io(process.env.REACT_APP_API_URL);
}

export default socket;
