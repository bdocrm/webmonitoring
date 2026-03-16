'use client';

import React from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle } from 'lucide-react';

const securityScoreHistoryData = [
  { date: 'Jan 1', score: 650 },
  { date: 'Jan 8', score: 680 },
  { date: 'Jan 15', score: 720 },
  { date: 'Jan 22', score: 760 },
  { date: 'Jan 29', score: 800 },
  { date: 'Feb 5', score: 850 },
];

const securityHeadersData = [
  { header: 'HSTS', status: 'present' },
  { header: 'CSP', status: 'present' },
  { header: 'X-Frame-Options', status: 'present' },
  { header: 'X-Content-Type', status: 'missing' },
  { header: 'X-XSS-Protection', status: 'missing' },
];

export default function SecurityPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your website&apos;s security posture and vulnerability status
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Security Rating"
            value="880"
            unit="/ 950"
            trend="up"
            trendValue="+30 points"
            icon="🛡️"
          />
          <KPICard
            title="HTTPS Status"
            value="✓"
            trend="neutral"
            icon="🔒"
          />
          <KPICard
            title="SSL Certificate"
            value="Valid"
            trend="neutral"
            icon="📜"
          />
          <KPICard
            title="Known Vulnerabilities"
            value="0"
            trend="up"
            trendValue="No issues found"
            icon="✅"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Security Score History */}
          <Card>
            <CardHeader>
              <CardTitle>Security Rating History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={securityScoreHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 950]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Security Headers Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Security Headers Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityHeadersData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg border border-border"
                  >
                    {item.status === 'present' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.header}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.status === 'present' ? 'Configured' : 'Not found'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Security Details & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'HTTPS/SSL Encryption',
                  status: 'secure',
                  details: 'Your website is served over HTTPS with a valid SSL certificate. Excellent security posture.',
                  recommendation: 'Continue to renew certificate before expiration.',
                },
                {
                  title: 'Content Security Policy',
                  status: 'secure',
                  details:
                    'CSP header is properly configured to prevent XSS attacks.',
                  recommendation: 'Review CSP policy regularly for optimal protection.',
                },
                {
                  title: 'X-Content-Type-Options',
                  status: 'warning',
                  details:
                    'This header is missing. It prevents MIME type sniffing attacks.',
                  recommendation:
                    'Add X-Content-Type-Options: nosniff to your server headers.',
                },
                {
                  title: 'X-XSS-Protection',
                  status: 'warning',
                  details:
                    'Legacy XSS protection header is not configured. Modern browsers use CSP instead.',
                  recommendation:
                    'Consider adding X-XSS-Protection: 1; mode=block for compatibility.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    item.status === 'secure'
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div>
                      {item.status === 'secure' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.details}
                      </p>
                      <p className="text-sm font-medium mt-2 text-foreground">
                        Recommendation: {item.recommendation}
                      </p>
                    </div>
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
