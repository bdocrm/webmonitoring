'use client';

import React from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const seoIssuesData = [
  { name: 'Missing Meta Description', value: 12 },
  { name: 'Duplicate Title', value: 5 },
  { name: 'Missing H1', value: 3 },
  { name: 'Broken Internal Links', value: 8 },
  { name: 'Slow Pages', value: 6 },
];

const pageDepthData = [
  { depth: 'Level 1', pages: 45 },
  { depth: 'Level 2', pages: 89 },
  { depth: 'Level 3', pages: 123 },
  { depth: 'Level 4+', pages: 34 },
];

export default function SEOPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">SEO Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your website&apos;s SEO health and performance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Site Health Score"
            value="72"
            unit="/ 100"
            trend="up"
            trendValue="+5 from last scan"
            icon="📊"
          />
          <KPICard
            title="AI Search Health"
            value="84"
            unit="/ 100"
            trend="up"
            trendValue="+2 from last scan"
            icon="🤖"
          />
          <KPICard
            title="Total Pages Indexed"
            value="291"
            trend="neutral"
            icon="📄"
          />
          <KPICard
            title="Crawlability Score"
            value="90"
            unit="/ 100"
            trend="up"
            trendValue="+3 points"
            icon="🕷️"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SEO Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Top SEO Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seoIssuesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F08530" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Page Depth Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Page Depth Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageDepthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="depth" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pages" fill="#4094d9" name="Pages" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Issues Detail Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Issues Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  issue: 'Missing Meta Descriptions',
                  count: 12,
                  severity: 'high',
                  description: 'These pages will have less appealing snippets in search results.',
                  pages: ['page-1.html', 'page-2.html', 'page-3.html'],
                },
                {
                  issue: 'Duplicate Page Titles',
                  count: 5,
                  severity: 'medium',
                  description: 'Duplicate titles can confuse search engines about page content.',
                  pages: ['about.html', 'team.html'],
                },
                {
                  issue: 'Missing H1 Tags',
                  count: 3,
                  severity: 'medium',
                  description: 'H1 tags help search engines understand page hierarchy.',
                  pages: ['contact.html', 'faq.html'],
                },
                {
                  issue: 'Broken Internal Links',
                  count: 8,
                  severity: 'high',
                  description: '404 errors occur when clicking these links internally.',
                  pages: ['blog-post-1.html', 'product.html'],
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg bg-secondary/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.issue}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {item.pages.map((page, i) => (
                          <span
                            key={i}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded ${
                        item.severity === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
