'use client';

import React from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const performanceMetricsData = [
  { metric: 'FCP', value: 1.6, target: 1.8 },
  { metric: 'LCP', value: 2.7, target: 2.5 },
  { metric: 'CLS', value: 0.08, target: 0.1 },
  { metric: 'TTFB', value: 0.4, target: 0.6 },
];

const performanceHistoryData = [
  { date: 'Jan 1', score: 78 },
  { date: 'Jan 8', score: 80 },
  { date: 'Jan 15', score: 82 },
  { date: 'Jan 22', score: 85 },
  { date: 'Jan 29', score: 88 },
  { date: 'Feb 5', score: 90 },
  { date: 'Feb 12', score: 95 },
];

const pageSpeedData = [
  { name: 'Fast (< 2s)', value: 156 },
  { name: 'Moderate (2-4s)', value: 89 },
  { name: 'Slow (> 4s)', value: 46 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function PerformancePage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground mt-2">
            Track your website&apos;s performance metrics and optimization opportunities
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Performance Score"
            value="95"
            unit="/ 100"
            trend="up"
            trendValue="+10 from last month"
            icon="⚡"
          />
          <KPICard
            title="FCP"
            value="1.6"
            unit="s"
            trend="up"
            trendValue="-0.2s from last week"
            icon="🚀"
          />
          <KPICard
            title="LCP"
            value="2.7"
            unit="s"
            trend="up"
            trendValue="-0.5s from last week"
            icon="📈"
          />
          <KPICard
            title="CLS"
            value="0.08"
            trend="neutral"
            icon="📊"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Current" />
                  <Bar dataKey="target" fill="#10b981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Score History */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Score History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Page Speed Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Page Speed Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pageSpeedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pageSpeedData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Minify CSS', savings: '24 KB', impact: 'High' },
                  { title: 'Optimize Images', savings: '156 KB', impact: 'High' },
                  { title: 'Enable GZIP Compression', savings: '45 KB', impact: 'Medium' },
                  { title: 'Remove Unused JavaScript', savings: '89 KB', impact: 'High' },
                  { title: 'Defer Off-screen Images', savings: '32 KB', impact: 'Medium' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Potential savings: {item.savings}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        item.impact === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
