import { ReactNode } from 'react';

// This layout marks the share page as public - no authentication required
export const dynamic = 'force-dynamic';

export default function ShareLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
