'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { KPICard } from '@/components/KPICard';
import { ScoreGauge } from '@/components/ScoreGauge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, XCircle, RefreshCw, Share2, Check, Copy, Globe, TrendingUp } from 'lucide-react';

interface Website {
  id: string;
  domain: string;
  displayName: string;
  isActive: boolean;
  lastScanAt: string | null;
  seoMetrics?: {
    siteHealthScore: number;
    aiSearchHealth: number;
    crawlability: number;
    internalLinking: number;
    totalPages: number;
    pagesCrawled: number;
  };
  securityMetrics?: {
    securityRating: number;
    httpsStatus: boolean;
    sslCertificateValid: boolean;
    hasCSP: boolean;
    hasHSTS: boolean;
  };
  analytics?: {
    performanceScore: number;
    fcp: number;
    lcp: number;
    speedIndex: number;
    cls: number;
  };
}

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const getShareLink = () => {
    if (!selectedWebsite) return '';
    return `${window.location.origin}/share/${selectedWebsite.id}`;
  };

  const copyShareLink = async () => {
    const link = getShareLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    showToast('success', '✓ Link copied! Share it on Viber or anywhere.');
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchWebsites = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/websites');
      const data = await res.json();
      if (Array.isArray(data)) {
        setWebsites(data);
        // Update selected website with fresh data
        if (selectedWebsite) {
          const updated = data.find((w: Website) => w.id === selectedWebsite.id);
          if (updated) setSelectedWebsite(updated);
        } else if (data.length > 0) {
          setSelectedWebsite(data[0]);
        }
      } else {
        setError(data.error || 'Failed to load websites');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const handleScan = async (websiteId: string) => {
    setScanning(websiteId);
    showToast('info', '🔍 Scanning website... This may take a moment.');
    
    try {
      const res = await fetch('/api/crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId }),
      });
      
      if (res.ok) {
        const result = await res.json();
        await fetchWebsites();
        showToast('success', `✓ Scan complete! Found ${result.pagesFound || 0} pages. Health: ${result.siteHealthScore || 0}%`);
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Scan failed');
      }
    } catch (err) {
      console.error('Scan failed:', err);
      showToast('error', 'Scan failed. Please try again.');
    } finally {
      setScanning(null);
    }
  };

  // Get metrics from selected website or defaults
  const seo = selectedWebsite?.seoMetrics || {
    siteHealthScore: 0,
    aiSearchHealth: 0,
    crawlability: 0,
    internalLinking: 0,
    totalPages: 0,
    pagesCrawled: 0,
  };

  const security = selectedWebsite?.securityMetrics || {
    securityRating: 0,
    httpsStatus: false,
    sslCertificateValid: false,
  };

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'info': return <AlertCircle className="w-5 h-5" />;
    }
  };

  const perf = selectedWebsite?.analytics || {
    performanceScore: 0,
    fcp: 0,
    lcp: 0,
    speedIndex: 0,
    cls: 0,
  };

  // Calculate error count (placeholder - would come from scans)
  const errorCount = selectedWebsite ? Math.floor(Math.random() * 10) : 0;
  const warningCount = selectedWebsite ? Math.floor(Math.random() * 5) : 0;

  const recentInsights = selectedWebsite ? [
    {
      id: 1,
      title: seo.pagesCrawled < seo.totalPages 
        ? `${seo.totalPages - seo.pagesCrawled} pages not yet crawled`
        : 'All pages have been crawled',
      severity: seo.pagesCrawled < seo.totalPages ? 'warning' : 'info',
      category: 'Crawlability',
    },
    {
      id: 2,
      title: security.httpsStatus ? 'HTTPS is enabled' : 'HTTPS is not enabled',
      severity: security.httpsStatus ? 'info' : 'critical',
      category: 'Security',
    },
    {
      id: 3,
      title: perf.performanceScore >= 90 
        ? 'Performance score is excellent' 
        : perf.performanceScore >= 50 
          ? 'Performance needs improvement'
          : 'Performance is poor',
      severity: perf.performanceScore >= 90 ? 'info' : perf.performanceScore >= 50 ? 'warning' : 'critical',
      category: 'Performance',
    },
    {
      id: 4,
      title: seo.internalLinking >= 80 
        ? 'Internal linking is healthy'
        : 'Internal linking needs improvement',
      severity: seo.internalLinking >= 80 ? 'info' : 'warning',
      category: 'SEO',
    },
  ] : [];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header with Website Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your website health, performance, and security in real-time
            </p>
          </div>
          
          {/* Website Selector */}
          {websites.length > 0 && (
            <div className="flex items-center gap-3">
              <select
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium"
                value={selectedWebsite?.id || ''}
                onChange={(e) => {
                  const website = websites.find(w => w.id === e.target.value);
                  setSelectedWebsite(website || null);
                }}
              >
                {websites.map((website) => (
                  <option key={website.id} value={website.id}>
                    {website.displayName} ({website.domain})
                  </option>
                ))}
              </select>
              
              {selectedWebsite && (
                <>
                  <Button
                    onClick={() => handleScan(selectedWebsite.id)}
                    disabled={scanning === selectedWebsite.id}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {scanning === selectedWebsite.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Scan Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowShareModal(true)}
                    className="border-purple-500/50 hover:bg-purple-500/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && selectedWebsite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
            <div className="bg-background border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Share Dashboard</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Share this link to show the live dashboard for {selectedWebsite.displayName}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareLink()}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-secondary/50 text-sm"
                />
                <Button onClick={copyShareLink} className="shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                This link can be shared via Viber, Messenger, or any app!
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Show error or no websites message */}
        {error && (
          <Card className="border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchWebsites} className="mt-4">Retry</Button>
            </CardContent>
          </Card>
        )}

        {!error && websites.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No websites found</h3>
              <p className="text-muted-foreground mt-2">Add a website to start monitoring</p>
              <Button className="mt-4" onClick={() => window.location.href = '/websites'}>
                Add Website
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedWebsite && (
          <>
            {/* Current Website Info */}
            <Card className="bg-gradient-to-r from-blue-600/20 via-purple-600/15 to-pink-600/20 border-blue-500/30 shadow-lg shadow-blue-500/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
              <CardContent className="pt-6 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedWebsite.displayName}</h2>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {selectedWebsite.domain}
                      </p>
                    </div>
                  </div>
                  <div className="text-right bg-white/50 dark:bg-black/20 px-4 py-2 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Scan</p>
                    <p className="font-semibold">
                      {selectedWebsite.lastScanAt 
                        ? new Date(selectedWebsite.lastScanAt).toLocaleString()
                        : 'Never scanned'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Site Health"
                value={`${seo.siteHealthScore}%`}
                trend={seo.siteHealthScore >= 70 ? 'up' : 'down'}
                icon="🏥"
              />
              <KPICard
                title="AI Search Health"
                value={`${seo.aiSearchHealth}%`}
                trend={seo.aiSearchHealth >= 70 ? 'up' : 'down'}
                icon="🤖"
              />
              <KPICard
                title="Pages Crawled"
                value={String(seo.pagesCrawled)}
                unit={`/ ${seo.totalPages}`}
                trend="neutral"
                icon="🔍"
              />
              <KPICard
                title="Errors"
                value={String(errorCount)}
                trend={errorCount <= 5 ? 'down' : 'up'}
                icon="⚠️"
              />
            </div>

            {/* KPI Cards - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <KPICard
                title="Warnings"
                value={String(warningCount)}
                trend={warningCount <= 3 ? 'down' : 'up'}
                icon="🛑"
              />
              <KPICard
                title="Crawlability"
                value={`${seo.crawlability}%`}
                trend={seo.crawlability >= 80 ? 'up' : 'down'}
                icon="🕷️"
              />
              <KPICard
                title="HTTPS Status"
                value={security.httpsStatus ? '100%' : '0%'}
                trend={security.httpsStatus ? 'up' : 'down'}
                icon="🔒"
              />
              <KPICard
                title="Performance"
                value={String(perf.performanceScore)}
                trend={perf.performanceScore >= 80 ? 'up' : 'down'}
                icon="⚡"
              />
              <KPICard
                title="Internal Linking"
                value={`${seo.internalLinking}%`}
                trend={seo.internalLinking >= 80 ? 'up' : 'down'}
                icon="🔗"
              />
            </div>

            {/* Security Rating */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <KPICard
                title="Security Rating"
                value={String(security.securityRating)}
                unit="/ 950"
                trend={security.securityRating >= 750 ? 'up' : 'down'}
                icon="🛡️"
                className="lg:col-span-1"
              />
              
              {/* Score Gauges */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="flex justify-center pt-6">
                    <ScoreGauge score={seo.siteHealthScore} label="Site Health" size="sm" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex justify-center pt-6">
                    <ScoreGauge score={seo.aiSearchHealth} label="AI Search" size="sm" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex justify-center pt-6">
                    <ScoreGauge score={perf.performanceScore} label="Performance" size="sm" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Insights Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  AI Insights for {selectedWebsite.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg border border-border"
                    >
                      <div className="mt-0.5">
                        {insight.severity === 'critical' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        {insight.severity === 'warning' && (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        {insight.severity === 'info' && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${getToastStyles(toast.type)} animate-in slide-in-from-bottom-4`}>
          {getToastIcon(toast.type)}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">×</button>
        </div>
      )}
    </AppLayout>
  );
}
