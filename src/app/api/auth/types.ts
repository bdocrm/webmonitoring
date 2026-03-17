import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    provider?: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    role: string;
    provider?: string;
  }
}
