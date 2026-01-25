import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
  client: {
    // Añade esta configuración
    generator: "prisma-client-js",
    output: "node_modules/.prisma/client"
  }
});