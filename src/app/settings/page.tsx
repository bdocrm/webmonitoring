'use client';

import React from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [settings, setSettings] = React.useState({
    siteName: 'WebSiteMonitoringMo!',
    email: '',
    scanInterval: 24,
    maxPages: 100,
    crawlTimeout: 30,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // Save settings to backend
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure application settings and preferences
          </p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Site Name</label>
              <Input
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Admin Email</label>
              <Input
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Crawler Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Crawler Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Scan Interval (hours)</label>
              <Input
                name="scanInterval"
                type="number"
                value={settings.scanInterval}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Pages per Scan</label>
              <Input
                name="maxPages"
                type="number"
                value={settings.maxPages}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Crawl Timeout (seconds)</label>
              <Input
                name="crawlTimeout"
                type="number"
                value={settings.crawlTimeout}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4"
              />
              <label className="text-sm">Email alerts for critical issues</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4"
              />
              <label className="text-sm">Daily scan reports</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4"
              />
              <label className="text-sm">Weekly summary emails</label>
            </div>
          </CardContent>
        </Card>

        {/* API & Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>API & Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Google PageSpeed API Key</label>
              <Input
                type="password"
                placeholder="Enter your API key"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Required for performance monitoring features
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Delete All Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Delete all websites, scans, and metrics. This action cannot be undone.
              </p>
              <Button variant="destructive" className="mt-3">
                Delete All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </AppLayout>
  );
}
