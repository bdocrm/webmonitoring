'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Globe2,
  Loader2,
  MessageCircle,
  Newspaper,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type {
  ConnectorState,
  ListeningChannel,
  ListeningConnector,
  ListeningMention,
  ListeningResponse,
  SentimentLabel,
} from '@/lib/listening/types';

type ChannelFilter = 'all' | ListeningChannel;

const channelFilters: Array<{ id: ChannelFilter; label: string }> = [
  { id: 'all', label: 'All sources' },
  { id: 'google', label: 'Google' },
  { id: 'social', label: 'Social' },
  { id: 'web', label: 'Web' },
];

const sentimentStyles: Record<SentimentLabel, string> = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  negative: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
};

const connectorStyles: Record<ConnectorState, string> = {
  live: 'bg-emerald-500',
  degraded: 'bg-rose-500',
  not_configured: 'bg-slate-300 dark:bg-slate-600',
};

function formatDate(value: string | null): string {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function sourceIcon(mention: ListeningMention) {
  if (mention.channel === 'social') return MessageCircle;
  if (mention.discoveredBy === 'Google News') return Newspaper;
  if (mention.channel === 'google') return Search;
  return Globe2;
}

function connectorStatus(connector: ListeningConnector): string {
  if (connector.state === 'live') return `${connector.count} fetched`;
  if (connector.state === 'degraded') return 'Unavailable';
  return 'Not configured';
}

export default function ListeningPage() {
  const [data, setData] = useState<ListeningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelFilter>('all');

  const loadMentions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/listening', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load listening data.');
      setData(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load listening data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMentions();
  }, [loadMentions]);

  const filteredMentions = useMemo(() => {
    if (!data) return [];
    if (channel === 'all') return data.mentions;
    return data.mentions.filter((mention) => mention.channel === channel);
  }, [channel, data]);

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-tufts">
              <Radio className="h-4 w-4" />
              Brand intelligence
            </div>
            <h1 className="text-3xl font-bold">Listening</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified public mentions for {data?.brand || 'Allianz-Synergia'} across Google and social sources.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {data?.googleSearchUrl && (
              <a
                href={data.googleSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
              >
                <Search className="h-4 w-4" />
                Verify on Google
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <Button onClick={loadMentions} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-start justify-between gap-4 border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadMentions}>Retry</Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Verified mentions</p>
              <p className="mt-2 text-3xl font-bold">{data?.summary.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Found via Google</p>
              <p className="mt-2 text-3xl font-bold text-brand-tufts">{data?.summary.google ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Social mentions</p>
              <p className="mt-2 text-3xl font-bold">{data?.summary.social ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Negative signals</p>
              <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">{data?.summary.negative ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby="connector-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="connector-heading" className="text-lg font-semibold">Source health</h2>
            {data?.generatedAt && (
              <p className="text-xs text-muted-foreground">Checked {formatDate(data.generatedAt)}</p>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(data?.connectors || []).map((connector) => (
              <div key={connector.id} className="border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${connectorStyles[connector.state]}`} />
                    <p className="truncate text-sm font-semibold">{connector.label}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{connectorStatus(connector)}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{connector.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="mentions-heading">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="mentions-heading" className="text-lg font-semibold">Mentions</h2>
              <p className="text-xs text-muted-foreground">{filteredMentions.length} source-linked result{filteredMentions.length === 1 ? '' : 's'}</p>
            </div>
            <div className="inline-flex w-fit rounded-md border border-border bg-card p-1" role="group" aria-label="Filter mentions by source">
              {channelFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setChannel(filter.id)}
                  className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                    channel === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border border border-border bg-card">
            {loading && !data && (
              <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Collecting live mentions...
              </div>
            )}

            {!loading && !error && filteredMentions.length === 0 && (
              <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
                <ShieldCheck className="h-9 w-9 text-emerald-600" />
                <p className="mt-3 font-semibold">No matching mentions in this view</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Connected sources returned no exact Allianz-Synergia records for this filter.
                </p>
              </div>
            )}

            {filteredMentions.map((mention) => {
              const SourceIcon = sourceIcon(mention);
              return (
                <article key={mention.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <SourceIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{mention.source}</span>
                        <span>{mention.publisher}</span>
                        <span>{formatDate(mention.publishedAt)}</span>
                        {mention.isOwned && <span className="border border-border px-2 py-0.5">Owned</span>}
                      </div>
                      <h3 className="mt-2 text-base font-semibold leading-6">{mention.title}</h3>
                      {mention.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{mention.excerpt}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded border px-2 py-1 text-xs font-semibold capitalize ${sentimentStyles[mention.sentiment]}`}>
                          {mention.sentiment}
                        </span>
                        <span className="text-xs text-muted-foreground">Found by {mention.discoveredBy}</span>
                        {mention.engagement && (
                          <span className="text-xs text-muted-foreground">
                            {mention.engagement.score ?? 0} score / {mention.engagement.comments ?? 0} comments
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={mention.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open source for ${mention.title}`}
                      title="Open original source"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border hover:bg-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="border-l-4 border-brand-tufts bg-secondary/40 px-4 py-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-tufts" />
            <p className="text-xs leading-5 text-muted-foreground">
              Data integrity: exact brand aliases are required, Allianz PNB and Allianz Life are excluded, duplicate URLs are removed, and every record links to its public source. Sentiment is a rule-based triage signal, not a verified statement of fact.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
