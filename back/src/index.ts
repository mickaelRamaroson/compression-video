import server from "./app";
import { config } from "dotenv";

config();

server.listen(process.env.PORT, () => {
  console.log("server is running on " + process.env.PORT);
});
