import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@websitemonitoring.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with:', { email: credentials?.email });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error('Email and password are required');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            throw new Error('No user found with that email');
          }

          if (!user.password) {
            console.log('❌ User has no password set (OAuth only?):', credentials.email);
            throw new Error('This account uses OAuth login only');
          }

          console.log('✅ User found, checking password...');
          const passwordMatch = await bcryptjs.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            console.log('❌ Password mismatch for user:', credentials.email);
            throw new Error('Invalid password');
          }

          console.log('✅ Password match, returning user:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('💥 Auth error:', error);
          throw error;
        }
      },
    }),
    // OAuth Providers (optional - only if both ID and SECRET are set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
    ] : []),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      // OAuth account linking
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).provider = token.provider;
      }
      return session;
    },
    // Handle OAuth user creation
    async signIn({ user, profile }) {
      if (user?.email && profile?.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            console.log('✨ Creating new OAuth user:', profile.email);
            await prisma.user.create({
              data: {
                email: profile.email,
                name: user.name || profile.name || 'OAuth User',
                password: '', // OAuth users have no password
                role: 'user',
              },
            });
          }
        } catch (error) {
          console.error('❌ OAuth user creation failed:', error);
        }
      }
      return true;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn({ user, isNewUser }) {
      console.log(`✅ User signed in: ${user?.email} (New: ${isNewUser})`);
    },
    async signOut({ token }) {
      console.log(`👋 User signed out: ${token?.email}`);
    },
  },
};
