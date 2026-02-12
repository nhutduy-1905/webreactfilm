<<<<<<< HEAD
import {PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export default client;
=======
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
