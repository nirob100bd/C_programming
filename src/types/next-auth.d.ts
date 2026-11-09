import type { DefaultSession } from "next-auth";

export {};

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}
