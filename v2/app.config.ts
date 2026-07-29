import { createApp } from "vinxi";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "client",
      type: "spa",
      handler: "./src/entry-client.tsx",
      target: "browser",
      plugins: () => [tailwindcss()],
      base: "/",
    },
    {
      name: "ssr",
      type: "http",
      handler: "./src/entry-server.tsx",
      target: "server",
      plugins: () => [tanstackStart(), tailwindcss()],
      base: "/",
    },
  ],
});
