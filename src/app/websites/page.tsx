'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Website {
  id: string;
  domain: string;
  displayName: string;
  createdAt: string;
  lastScanAt: string | null;
  isActive: boolean;
}

interface ScanResult {
  pagesScanned: number;
  pagesFound: number;
  errors: number;
  warnings: number;
  siteHealthScore: number;
  securityRating: number;
}

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Show toast notification
  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch websites from API
  const fetchWebsites = async () => {
    try {
      setError(null);
      const res = await fetch('/api/websites');
      const data = await res.json();
      if (Array.isArray(data)) {
        setWebsites(data);
      } else {
        console.error('API returned non-array:', data);
        setError(data.error || 'Failed to load websites');
        setWebsites([]);
      }
    } catch (err) {
      console.error('Failed to fetch websites:', err);
      setError('Failed to connect to server');
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleAddWebsite = async () => {
    if (newDomain && newDisplayName) {
      try {
        const res = await fetch('/api/websites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: newDomain,
            displayName: newDisplayName,
          }),
        });
        if (res.ok) {
          await fetchWebsites();
          setNewDomain('');
          setNewDisplayName('');
          setIsDialogOpen(false);
          showToast('success', `✓ Website "${newDisplayName}" added successfully!`);
        } else {
          const data = await res.json();
          showToast('error', data.error || 'Failed to add website');
        }
      } catch (error) {
        console.error('Failed to add website:', error);
        showToast('error', 'Failed to add website. Please try again.');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const res = await fetch(`/api/websites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWebsites(websites.filter((w) => w.id !== id));
        showToast('success', `✓ Website "${name}" deleted successfully!`);
      } else {
        showToast('error', 'Failed to delete website');
      }
    } catch (error) {
      console.error('Failed to delete website:', error);
      showToast('error', 'Failed to delete website. Please try again.');
    }
  };

  const [scanning, setScanning] = useState<string | null>(null);

  const handleScan = async (id: string, name: string) => {
    setScanning(id);
    setScanResult(null);
    showToast('info', `🔍 Scanning "${name}"... This may take a moment.`);
    
    try {
      const res = await fetch('/api/crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: id }),
      });
      
      if (res.ok) {
        const result = await res.json();
        setScanResult(result);
        await fetchWebsites();
        showToast('success', `✓ Scan completed! Found ${result.pagesFound || 0} pages. Health: ${result.siteHealthScore || 0}%`);
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Scan failed');
      }
    } catch (error) {
      console.error('Failed to scan website:', error);
      showToast('error', 'Scan failed. Please try again.');
    } finally {
      setScanning(null);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'info': return 'bg-brand-tufts text-white';
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'info': return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">Websites</h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor your websites
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Website
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Website</DialogTitle>
                <DialogDescription>
                  Add a website to monitor and track its performance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Domain</label>
                  <Input
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    placeholder="My Website"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddWebsite}>Add Website</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Websites Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monitored Websites</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading websites...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <Button onClick={fetchWebsites} className="mt-4">Retry</Button>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Domain
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Display Name
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Status
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Created
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Last Scan
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {websites.map((website) => (
                    <tr
                      key={website.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <code className="text-sm bg-secondary px-2 py-1 rounded">
                          {website.domain}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm">{website.displayName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                            website.isActive
                          )}`}
                        >
                          {website.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(website.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {website.lastScanAt ? new Date(website.lastScanAt).toLocaleDateString() : 'Not scanned'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleScan(website.id, website.displayName)}
                            disabled={scanning === website.id}
                            title="Scan website"
                          >
                            {scanning === website.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(website.id, website.displayName)}
                            title="Delete website"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {websites.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No websites added yet. Click &quot;Add Website&quot; to get started.
                </div>
              )}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Results Card */}
        {scanResult && (
          <Card className="border-green-500/50 bg-green-50/10">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Last Scan Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold">{scanResult.pagesFound}</div>
                  <div className="text-sm text-muted-foreground">Pages Found</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold">{scanResult.siteHealthScore}%</div>
                  <div className="text-sm text-muted-foreground">Site Health</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold">{scanResult.securityRating}</div>
                  <div className="text-sm text-muted-foreground">Security Score</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">{scanResult.warnings}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
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
