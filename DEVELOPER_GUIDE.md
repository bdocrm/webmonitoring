# Developer Guide - Understanding the Codebase

## 🏗️ Architecture Overview

### Technology Stack Layer Breakdown

```
┌─────────────────────────────────────────────────────────┐
│  Frontend Layer (Next.js 14 App Router)                  │
│  ├─ Pages (dashboard, websites, seo, security, etc.)    │
│  ├─ React Components (KPICard, ScoreGauge, AppLayout)   │
│  └─ UI Components (Button, Card, Dialog, Tabs)          │
├─────────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes)                          │
│  ├─ /api/websites/* - Website CRUD                      │
│  ├─ /api/crawler/* - Crawler operations                 │
│  ├─ /api/seo/* - SEO analysis                           │
│  └─ /api/security/* - Security checks                   │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer (/lib)                             │
│  ├─ crawler/ - Web crawling engine                       │
│  ├─ seo/ - SEO scoring algorithms                        │
│  └─ security/ - Security analysis                        │
├─────────────────────────────────────────────────────────┤
│  Data Layer (Prisma ORM)                                 │
│  └─ Prisma Client with PostgreSQL                        │
└─────────────────────────────────────────────────────────┘
```

## 📂 Directory Structure Explained

### `/src/app` - Next.js Pages
Each page is a complete feature with its own route:

```typescript
// src/app/dashboard/page.tsx
- Displays main KPIs
- Shows analytics charts
- AI Insights panel
- Responsive grid layout
```

### `/src/components` - React Components

**UI Components** (`/components/ui/`)
- Reusable, headless UI components
- Built with Radix UI primitives
- Styled with TailwindCSS
- Example: Button, Card, Dialog

**Custom Components**
- `KPICard` - Displays metrics with trends
- `ScoreGauge` - Circular progress indicator
- `AppLayout` - Main layout with sidebar

### `/src/lib` - Business Logic

```
lib/
├── crawler/          # Web crawling implementation
│   └── index.ts     # crawlWebsite(), detectBrokenLinks()
├── seo/             # SEO scoring algorithms
│   └── scoring.ts   # calculateSiteHealthScore(), etc.
├── security/        # Security checking
│   └── rating.ts    # calculateSecurityRating(), checkSSLCertificate()
├── prisma.ts        # Prisma client singleton
├── env.ts           # Environment config
└── utils.ts         # Utility functions (cn(), etc.)
```

### `/prisma` - Database Schema

```
prisma/
├── schema.prisma    # Database models (10 models)
└── migrations/      # Database migration files
```

## 🔄 Request Flow Example

### Adding a New Website

```
1. User clicks "Add Website" button
   ↓
2. Form submitted to /api/websites POST

3. Backend (src/app/api/websites/route.ts):
   - Validates input
   - Creates Website record
   - Creates related SeoMetrics
   - Creates SecurityMetrics
   - Returns JSON response
   ↓
4. Frontend updates UI
```

### Running a Website Scan

```
1. User clicks "Start Scan"
   ↓
2. POST /api/crawler
   ↓
3. Backend calls crawlWebsite() from lib/crawler
   ↓
4. Crawler:
   - Fetches homepage
   - Extracts links
   - Crawls pages recursively
   - Saves pages to database
   - Tracks errors
   ↓
5. Response with scan ID
   ↓
6. Frontend polls for status updates
```

## 📊 Key Business Logic

### SEO Scoring (lib/seo/scoring.ts)

```typescript
calculateSiteHealthScore(metrics: {
  pagesWithMissingMetaDescription: number;
  pagesWithDuplicateTitle: number;
  brokenInternalLinks: number;
  totalPages: number;
  pagesCrawled: number;
}): number;
```

Formula:
- Meta Description: 25% × (pages with description / total)
- Unique Titles: 25% × (pages with unique titles / total)
- Link Health: 25% × (pages without broken links / total)
- Crawlability: 25% × (crawled pages / total pages)

### Security Rating (lib/security/rating.ts)

Max Score: 950 points
- HTTPS/SSL: 300 points (150 each for status + certificate)
- Security Headers: 400 points (80 each for 5 headers)
- CVE Issues: -50 points each

## 🗄️ Database Models Relationship

```
User
  └─ Sessions

Website (1)
  ├─ (many) Scan
  ├─ (many) Page
  ├─ (many) ErrorLog
  ├─ (1) SeoMetrics
  ├─ (1) SecurityMetrics
  └─ (1) Analytics

Scan (1)
  ├─ (many) Page
  └─ (many) ErrorLog
```

## 🛠️ Common Development Tasks

### Adding a New Page

1. Create page file: `src/app/[feature]/page.tsx`
2. Import AppLayout: `import { AppLayout } from '@/components/layouts/AppLayout'`
3. Wrap content with AppLayout
4. The sidebar will automatically include the new page (update navItems if needed)

### Adding a New API Endpoint

```typescript
// src/app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Handle request
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Using Prisma in API Routes

```typescript
import { prisma } from '@/lib/prisma';

// Query
const website = await prisma.website.findUnique({
  where: { id: websiteId },
  include: { seoMetrics: true },
});

// Create
const newWebsite = await prisma.website.create({
  data: {
    domain: 'example.com',
    displayName: 'Example',
  },
});

// Update
await prisma.website.update({
  where: { id: websiteId },
  data: { isActive: false },
});
```

## 🎨 Styling Approach

### TailwindCSS Convention

```typescript
// Button with multiple states
<button className={cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  isActive ? 'bg-primary text-white' : 'bg-secondary hover:bg-secondary/80'
)}>
  Click me
</button>
```

### Using the `cn()` Utility

```typescript
import { cn } from '@/lib/utils';

const className = cn(
  'base classes',
  active && 'active-only classes',
  variant === 'outline' && 'outline-specific classes'
);
```

## 🔍 Debugging Tips

### Enable Prisma Logging
```typescript
// Already configured in src/lib/prisma.ts
log: ['query'],
```

### Open Prisma Studio
```bash
npm run db:studio
```
Opens interactive database browser at localhost:5555

### View API Requests
- Open browser DevTools (F12)
- Go to Network tab
- Make API calls
- Click request to see details

### Debug JavaScript
Add `debugger;` statement and run:
```bash
node --inspect-brk node_modules/.bin/next dev
```

## 📝 Code Style Guidelines

### Component Structure
```typescript
'use client'; // For interactive components

import React from 'react';
import { Component } from '@/components/ui/component';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export function MyComponent({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = React.useState('');

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Validate input
    // Query database
    // Return response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

## 🚀 Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.png"
  alt="Description"
  width={800}
  height={600}
  priority // For above-the-fold
/>
```

### Code Splitting
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <div>Loading...</div> }
);
```

### Prisma Query Optimization
```typescript
// Don't over-fetch
const website = await prisma.website.findUnique({
  where: { id: websiteId },
  include: {
    seoMetrics: true,
    // Only include what you need
  },
});

// Use select for specific fields
const website = await prisma.website.findUnique({
  where: { id: websiteId },
  select: {
    id: true,
    domain: true,
    lastScanAt: true,
  },
});
```

## 🧪 Testing Approach

### Manual Testing Checklist

1. **Website Management**
   - [ ] Add new website
   - [ ] View website list
   - [ ] Update website name
   - [ ] Delete website

2. **Crawler**
   - [ ] Start scan
   - [ ] Verify pages are crawled
   - [ ] Check error detection

3. **SEO Analysis**
   - [ ] View SEO metrics
   - [ ] Check score calculations
   - [ ] View issues list

4. **Security**
   - [ ] Check HTTPS status
   - [ ] View security headers
   - [ ] Check security rating

5. **Responsive Design**
   - [ ] Desktop (1920px)
   - [ ] Tablet (768px)
   - [ ] Mobile (320px)

## 📚 Resources

**Next.js**
- Docs: https://nextjs.org/docs
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

**Prisma**
- Docs: https://www.prisma.io/docs/
- Schema: https://www.prisma.io/docs/orm/prisma-schema/data-model/models

**TailwindCSS**
- Docs: https://tailwindcss.com/docs
- Component Library: https://ui.shadcn.com/

**React**
- Docs: https://react.dev
- Hooks: https://react.dev/reference/react/hooks

## 🎓 Learning Path

1. Start with `/src/app/dashboard/page.tsx` - understand the page structure
2. Review `/src/components/layouts/AppLayout.tsx` - understand layout
3. Check `/src/lib/seo/scoring.ts` - understand business logic
4. Review `/src/app/api/websites/route.ts` - understand API routes
5. Explore `/prisma/schema.prisma` - understand database model

## 🤝 Contributing

When adding features:

1. ✅ Create new files in appropriate directories
2. ✅ Use TypeScript for type safety
3. ✅ Follow existing code style
4. ✅ Add JSDoc comments for functions
5. ✅ Test changes manually
6. ✅ Update documentation

---

**Happy coding!** 🚀

For questions about specific features, check the code comments throughout the project.
