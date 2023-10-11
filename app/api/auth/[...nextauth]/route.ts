import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { Credentials } from "@/schema/credentials";

const authOptions: AuthOptions = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     username: {
    //       label: "Username:",
    //       type: "text",
    //       placeholder: "Username",
    //     },
    //     password: {
    //       label: "Password:",
    //       type: "password",
    //       placeholder: "Password",
    //     },
    //   },
    //   authorize: async (data) => {
    //     const credentials = Credentials.safeParse(data);
    //     if (!credentials.success) return null;
    //     // TODO: retrieve user data
    //     const user = { id: "42", username: "Ville", password: "password" };
    //     const { username, password } = credentials.data;
    //     if (user.username !== username) return null;
    //     if (user.password !== password) return null;
    //     return user;
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile: (profile: GoogleProfile) => {
        return {
          ...profile,
          image: profile.picture,
          id: String(profile.email),
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile: (profile: GithubProfile) => {
        return {
          ...profile,
          image: profile.avatar_url,
          id: String(profile.id),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ user, token }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, handler, authOptions };
