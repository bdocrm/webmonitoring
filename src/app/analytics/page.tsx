'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';

interface Website {
  id: string;
  domain: string;
  displayName: string;
}

interface ScanHistory {
  date: string;
  siteHealth: number;
  aiSearch: number;
  security: number;
  performance: number;
  pagesFound: number;
}

export default function AnalyticsPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch websites list
  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const res = await fetch('/api/websites');
        const data = await res.json();
        if (Array.isArray(data)) {
          setWebsites(data);
          if (data.length > 0) {
            setSelectedWebsiteId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch websites:', err);
      }
    };

    fetchWebsites();
  }, []);

  // Fetch scan history when website changes
  useEffect(() => {
    if (!selectedWebsiteId) return;

    const fetchScanHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/crawler?websiteId=${selectedWebsiteId}`);
        const scans = await res.json();

        if (Array.isArray(scans)) {
          // Transform scans into chart data
          const history = scans
            .map((scan: any) => ({
              date: new Date(scan.startedAt).toLocaleDateString(),
              siteHealth: scan.seoMetrics?.siteHealthScore || 0,
              aiSearch: scan.seoMetrics?.aiSearchHealth || 0,
              security: scan.securityMetrics?.securityRating ? (scan.securityMetrics.securityRating / 10) : 0,
              performance: scan.analytics?.performanceScore || 0,
              pagesFound: scan.pagesFound || 0,
              time: new Date(scan.startedAt).toLocaleTimeString(),
            }))
            .reverse();

          setScanHistory(history);
        }
      } catch (err) {
        console.error('Failed to fetch scan history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScanHistory();
  }, [selectedWebsiteId, timeRange]);

  const avgScore = scanHistory.length > 0
    ? Math.round(scanHistory.reduce((acc, s) => acc + s.siteHealth, 0) / scanHistory.length)
    : 0;
  const improvement = scanHistory.length > 1
    ? scanHistory[scanHistory.length - 1].siteHealth - scanHistory[0].siteHealth
    : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              Analytics & Trends
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your website performance over time
            </p>
          </div>
        </div>

        {/* Website & Time Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Scans</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Website</label>
              <select
                value={selectedWebsiteId}
                onChange={(e) => setSelectedWebsiteId(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background"
              >
                {websites.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.displayName} ({w.domain})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {scanHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{scanHistory.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgScore}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvement > 0 ? '+' : ''}{improvement}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {scanHistory.length > 0 ? scanHistory[scanHistory.length - 1].siteHealth : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Site Health Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Site Health Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">Loading...</div>
            ) : scanHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={scanHistory}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4094d9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4094d9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Area type="monotone" dataKey="siteHealth" stroke="#4094d9" fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No scan history available. Start scanning to see trends!
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Metrics Comparison */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Metrics Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={scanHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="siteHealth" stroke="#4094d9" name="Site Health %" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="aiSearch" stroke="#10b981" name="AI Search %" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="security" stroke="#F08530" name="Security Score" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="performance" stroke="#160D76" name="Performance %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pages Found Trend */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pages Discovered Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scanHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pagesFound" fill="#4094d9" name="Pages Found" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
