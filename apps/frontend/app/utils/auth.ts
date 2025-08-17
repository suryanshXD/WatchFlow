import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "db/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
});
