'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { AlertCircle, Filter } from 'lucide-react';

interface ErrorRecord {
  id: string;
  url: string;
  errorType: string;
  statusCode: number;
  detectedAt: string;
  frequency: number;
}

export default function ErrorsPage() {
  const [errorRecords] = useState<ErrorRecord[]>([
    {
      id: '1',
      url: '/products/old-product',
      errorType: '404',
      statusCode: 404,
      detectedAt: '2024-03-16',
      frequency: 12,
    },
    {
      id: '2',
      url: '/admin/dashboard',
      errorType: '403',
      statusCode: 403,
      detectedAt: '2024-03-15',
      frequency: 8,
    },
    {
      id: '3',
      url: '/api/v1/users',
      errorType: '500',
      statusCode: 500,
      detectedAt: '2024-03-16',
      frequency: 5,
    },
    {
      id: '4',
      url: '/images/banner.jpg',
      errorType: '404',
      statusCode: 404,
      detectedAt: '2024-03-14',
      frequency: 3,
    },
    {
      id: '5',
      url: '/api/payment',
      errorType: '503',
      statusCode: 503,
      detectedAt: '2024-03-16',
      frequency: 2,
    },
  ]);

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const getErrorColor = (statusCode: number) => {
    if (statusCode === 404) return 'bg-brand-tufts/10 text-brand-tufts dark:bg-brand-tufts/20 dark:text-brand-tufts';
    if (statusCode === 403) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (statusCode >= 500)
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800';
  };

  const errorTypeCounts = errorRecords.reduce(
    (acc, err) => {
      acc[err.errorType] = (acc[err.errorType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredErrors = selectedType
    ? errorRecords.filter((e) => e.errorType === selectedType)
    : errorRecords;

  const totalErrors = errorRecords.reduce((sum, e) => sum + e.frequency, 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Errors</h1>
          <p className="text-muted-foreground mt-2">
            Track and analyze HTTP errors on your website
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Errors"
            value={errorRecords.length}
            trend="down"
            trendValue="-3 from last week"
            icon="⚠️"
          />
          <KPICard
            title="Error Occurrences"
            value={totalErrors}
            trend="down"
            trendValue="-8 from last week"
            icon="📊"
          />
          <KPICard
            title="404 Errors"
            value={errorRecords.filter((e) => e.statusCode === 404).length}
            trend="neutral"
            icon="🔍"
          />
          <KPICard
            title="Server Errors"
            value={errorRecords.filter((e) => e.statusCode >= 500).length}
            trend="up"
            trendValue="+1 from last week"
            icon="🔥"
          />
        </div>

        {/* Error Type Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter by Error Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                All ({errorRecords.length})
              </button>
              {Object.entries(errorTypeCounts).map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {type} ({count})
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      URL
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Error Type
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Status Code
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Frequency
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Detected
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredErrors.map((error) => (
                    <tr
                      key={error.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <code className="text-sm bg-secondary px-2 py-1 rounded">
                          {error.url}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getErrorColor(
                            error.statusCode
                          )}`}
                        >
                          {error.errorType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">
                        {error.statusCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {error.frequency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {error.detectedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Error Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium">Fix 404 Broken Links</p>
                  <p className="text-sm text-muted-foreground">
                    Redirect old URLs or restore deleted pages to reduce 404
                    errors.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg">🔄</span>
                <div>
                  <p className="font-medium">Review 403 Access Denied</p>
                  <p className="text-sm text-muted-foreground">
                    Check permissions and access control lists for restricted
                    resources.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg">🔧</span>
                <div>
                  <p className="font-medium">Monitor 500 Server Errors</p>
                  <p className="text-sm text-muted-foreground">
                    Review server logs and application errors to fix internal
                    server issues.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg">📱</span>
                <div>
                  <p className="font-medium">Update Internal Links</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure all internal navigation links point to valid URLs
                    and pages.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
