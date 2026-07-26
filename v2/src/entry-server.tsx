import { createHandler, StartServer } from "@tanstack/react-start/server";
import { createRouter } from "./router";

export default createHandler(
  createRouter().context,
  () => <StartServer router={createRouter()} />
);
