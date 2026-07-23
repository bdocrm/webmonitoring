import { load } from 'cheerio';
import type {
  ListeningChannel,
  ListeningConnector,
  ListeningMention,
  ListeningResponse,
  SentimentLabel,
} from './types';

const DEFAULT_ALIASES = [
  'Allianz Synergia',
  'Allianz-Synergia',
  'Allianz-Synergia, Inc.',
  'allianzsynergia.com.ph',
];

const DEFAULT_EXCLUSIONS = ['Allianz PNB', 'Allianz Life'];
const DEFAULT_WATCH_URLS = [
  'https://www.allianzsynergia.com.ph/',
  'https://ph.linkedin.com/company/allianz-synergiainc',
  'https://ccap.ph/membership/',
  'https://ibpap.org/members-list',
  'https://philjobnet.gov.ph/job-vacancies/company/allianz-synergia-inc-419685',
  'https://www.reddit.com/r/BPOinPH/comments/1ngxpfj/allianz_synergia/',
  'https://www.reddit.com/r/BPOinPH/comments/1l5fjkb/allianz_synergia/',
];
const OWNED_DOMAINS = new Set(['allianzsynergia.com.ph', 'www.allianzsynergia.com.ph']);
const REQUEST_TIMEOUT_MS = 12_000;

const POSITIVE_TERMS = [
  'commendation',
  'excellent',
  'good review',
  'great',
  'helpful',
  'professional',
  'reliable',
  'supportive',
  'trusted',
  'world-class',
  'world class',
  'maganda',
  'mabait',
  'goods naman',
];

const NEGATIVE_TERMS = [
  'bad review',
  'broken promise',
  'complaint',
  'do not apply',
  "don't attempt",
  'fraud',
  'low pay',
  'micromanag',
  'misleading',
  'never again',
  'scam',
  'stress',
  'toxic',
  'unrealistic',
  'warning',
  'walang recognition',
];

function splitSetting(value: string | undefined, fallback: string[]): string[] {
  const parsed = value
    ?.split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed?.length ? parsed : fallback;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compact(value: string): string {
  return normalize(value).replace(/\s+/g, '');
}

function isBrandMatch(text: string, aliases: string[], exclusions: string[]): boolean {
  const normalizedText = normalize(text);
  const compactText = compact(text);
  const matched = aliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return normalizedText.includes(normalizedAlias) || compactText.includes(compact(alias));
  });

  if (!matched) return false;
  if (compactText.includes('allianzsynergiacomph')) return true;

  return !exclusions.some((term) => normalizedText.includes(normalize(term)));
}

function scoreSentiment(text: string): { label: SentimentLabel; score: number } {
  const normalizedText = normalize(text);
  const positiveHits = POSITIVE_TERMS.filter((term) => normalizedText.includes(normalize(term))).length;
  const negativeHits = NEGATIVE_TERMS.filter((term) => normalizedText.includes(normalize(term))).length;
  const rawScore = positiveHits - negativeHits;

  if (rawScore > 0) return { label: 'positive', score: Math.min(1, rawScore / 3) };
  if (rawScore < 0) return { label: 'negative', score: Math.max(-1, rawScore / 3) };
  return { label: 'neutral', score: 0 };
}

function stableId(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `mention-${(hash >>> 0).toString(36)}`;
}

function cleanText(value: string): string {
  return load(`<div>${value}</div>`)('div').text().replace(/\s+/g, ' ').trim();
}

function canonicalUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
      url.searchParams.delete(key);
    });
    return url.toString();
  } catch {
    return value;
  }
}

function validDate(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function hostnameOf(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function sourceFromUrl(
  url: string,
  fallback: string,
  fallbackChannel: ListeningChannel
): { source: string; channel: ListeningChannel } {
  const hostname = hostnameOf(url);
  const socialSources: Array<[string, string]> = [
    ['reddit.com', 'Reddit'],
    ['facebook.com', 'Facebook'],
    ['instagram.com', 'Instagram'],
    ['linkedin.com', 'LinkedIn'],
    ['tiktok.com', 'TikTok'],
    ['youtube.com', 'YouTube'],
    ['youtu.be', 'YouTube'],
    ['x.com', 'X'],
    ['twitter.com', 'X'],
  ];
  const match = socialSources.find(([domain]) => hostname === domain || hostname.endsWith(`.${domain}`));

  return match
    ? { source: match[1], channel: 'social' }
    : { source: fallback, channel: fallbackChannel };
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent': 'WebSiteMonitoringMo/1.0 (public brand monitoring)',
        Accept: 'application/json, application/rss+xml, application/xml, text/xml, */*',
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parseFeed(
  xml: string,
  discoveredBy: string,
  fallbackSource: string,
  fallbackChannel: ListeningChannel
): ListeningMention[] {
  const $ = load(xml, { xmlMode: true });
  const mentions: ListeningMention[] = [];

  $('item, entry').each((_, element) => {
    const item = $(element);
    const title = cleanText(item.find('title').first().text());
    const excerpt = cleanText(
      item.find('description').first().text() ||
      item.find('summary').first().text() ||
      item.find('content').first().text()
    );
    const linkNode = item.find('link').first();
    const url = canonicalUrl(linkNode.attr('href') || linkNode.text().trim());
    if (!title || !url) return;

    const publisher = cleanText(item.find('source').first().text()) || hostnameOf(url) || fallbackSource;
    const classified = sourceFromUrl(url, fallbackSource, fallbackChannel);
    const sentiment = scoreSentiment(`${title} ${excerpt}`);

    mentions.push({
      id: stableId(url || title),
      title,
      excerpt,
      url,
      source: classified.source,
      publisher,
      discoveredBy,
      channel: classified.channel,
      publishedAt: validDate(
        item.find('pubDate').first().text() ||
        item.find('published').first().text() ||
        item.find('updated').first().text()
      ),
      author: cleanText(item.find('author name').first().text() || item.find('dc\\:creator').first().text()) || null,
      sentiment: sentiment.label,
      sentimentScore: sentiment.score,
      engagement: null,
      isOwned: OWNED_DOMAINS.has(hostnameOf(url)),
    });
  });

  return mentions;
}

async function fetchGoogleNews(query: string): Promise<ListeningMention[]> {
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'en-PH');
  url.searchParams.set('gl', 'PH');
  url.searchParams.set('ceid', 'PH:en');

  const response = await fetchWithTimeout(url.toString());
  if (!response.ok) throw new Error(`Google News returned HTTP ${response.status}`);
  return parseFeed(await response.text(), 'Google News', 'Google News', 'google');
}

async function fetchReddit(query: string): Promise<ListeningMention[]> {
  const url = new URL('https://www.reddit.com/search.json');
  url.searchParams.set('q', `\"${query}\"`);
  url.searchParams.set('sort', 'new');
  url.searchParams.set('t', 'all');
  url.searchParams.set('limit', '50');
  url.searchParams.set('raw_json', '1');

  const response = await fetchWithTimeout(url.toString());
  if (!response.ok) throw new Error(`Reddit returned HTTP ${response.status}`);

  const payload = await response.json() as {
    data?: {
      children?: Array<{
        data?: {
          id?: string;
          title?: string;
          selftext?: string;
          permalink?: string;
          author?: string;
          subreddit_name_prefixed?: string;
          created_utc?: number;
          score?: number;
          num_comments?: number;
        };
      }>;
    };
  };

  return (payload.data?.children || []).flatMap(({ data }) => {
    if (!data?.title || !data.permalink) return [];
    const urlValue = canonicalUrl(`https://www.reddit.com${data.permalink}`);
    const sentiment = scoreSentiment(`${data.title} ${data.selftext || ''}`);

    return [{
      id: data.id ? `reddit-${data.id}` : stableId(urlValue),
      title: cleanText(data.title),
      excerpt: cleanText(data.selftext || '').slice(0, 500),
      url: urlValue,
      source: 'Reddit',
      publisher: data.subreddit_name_prefixed || 'Reddit',
      discoveredBy: 'Reddit',
      channel: 'social' as const,
      publishedAt: data.created_utc ? new Date(data.created_utc * 1000).toISOString() : null,
      author: data.author || null,
      sentiment: sentiment.label,
      sentimentScore: sentiment.score,
      engagement: {
        score: data.score || 0,
        comments: data.num_comments || 0,
      },
      isOwned: false,
    }];
  });
}

async function fetchGoogleAlerts(feedUrls: string[]): Promise<ListeningMention[]> {
  const feeds = await Promise.all(feedUrls.map(async (url) => {
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Google Alerts feed returned HTTP ${response.status}`);
    return parseFeed(await response.text(), 'Google Alerts', 'Google Alerts', 'google');
  }));
  return feeds.flat();
}

async function fetchGoogleWeb(query: string, key: string, cx: string): Promise<ListeningMention[]> {
  const url = new URL('https://customsearch.googleapis.com/customsearch/v1');
  url.searchParams.set('key', key);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', query);
  url.searchParams.set('gl', 'ph');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('num', '10');

  const response = await fetchWithTimeout(url.toString());
  if (!response.ok) throw new Error(`Google Web returned HTTP ${response.status}`);
  const payload = await response.json() as {
    items?: Array<{ title?: string; link?: string; snippet?: string; displayLink?: string }>;
  };

  return (payload.items || []).flatMap((item) => {
    if (!item.title || !item.link) return [];
    const urlValue = canonicalUrl(item.link);
    const classified = sourceFromUrl(urlValue, 'Google Web', 'google');
    const excerpt = cleanText(item.snippet || '');
    const sentiment = scoreSentiment(`${item.title} ${excerpt}`);

    return [{
      id: stableId(urlValue),
      title: cleanText(item.title),
      excerpt,
      url: urlValue,
      source: classified.source,
      publisher: item.displayLink || hostnameOf(urlValue) || 'Google Web',
      discoveredBy: 'Google Web',
      channel: classified.channel,
      publishedAt: null,
      author: null,
      sentiment: sentiment.label,
      sentimentScore: sentiment.score,
      engagement: null,
      isOwned: OWNED_DOMAINS.has(hostnameOf(urlValue)),
    }];
  });
}

function excerptAroundBrand(value: string): string {
  const compactWhitespace = value.replace(/\s+/g, ' ').trim();
  const match = /allianz[\s-]+synergia/i.exec(compactWhitespace);
  if (!match?.index) return compactWhitespace.slice(0, 500);
  const start = Math.max(0, match.index - 180);
  return compactWhitespace.slice(start, start + 500).trim();
}

async function fetchWatchedPage(url: string): Promise<ListeningMention | null> {
  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!response.ok) throw new Error(`${hostnameOf(url)} returned HTTP ${response.status}`);

  const html = await response.text();
  const $ = load(html);
  $('script, style, noscript, svg').remove();
  const title = cleanText(
    $('meta[property="og:title"]').attr('content') ||
    $('title').first().text() ||
    hostnameOf(url)
  );
  const metaDescription = cleanText(
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    ''
  );
  const bodyText = cleanText($('body').text());
  const excerpt = metaDescription || excerptAroundBrand(bodyText);
  const searchableText = `${title} ${excerpt} ${bodyText}`;
  if (!/allianz[\s-]+synergia/i.test(searchableText) && !compact(searchableText).includes('allianzsynergia')) {
    return null;
  }

  const classified = sourceFromUrl(url, 'Web', 'web');
  const sentiment = scoreSentiment(`${title} ${excerpt}`);
  const canonical = canonicalUrl(
    $('link[rel="canonical"]').attr('href') ||
    $('meta[property="og:url"]').attr('content') ||
    url
  );

  return {
    id: stableId(canonical),
    title,
    excerpt,
    url: canonical,
    source: classified.source,
    publisher: cleanText($('meta[property="og:site_name"]').attr('content') || '') || hostnameOf(url),
    discoveredBy: 'Verified Web Watchlist',
    channel: classified.channel,
    publishedAt: validDate(
      $('meta[property="article:published_time"]').attr('content') ||
      $('time[datetime]').first().attr('datetime')
    ),
    author: cleanText($('meta[name="author"]').attr('content') || '') || null,
    sentiment: sentiment.label,
    sentimentScore: sentiment.score,
    engagement: null,
    isOwned: OWNED_DOMAINS.has(hostnameOf(canonical)),
  };
}

async function fetchWatchedPages(urls: string[]): Promise<ListeningMention[]> {
  const results = await Promise.allSettled(urls.map(fetchWatchedPage));
  const mentions = results.flatMap((result) => (
    result.status === 'fulfilled' && result.value ? [result.value] : []
  ));

  if (!mentions.length && results.some((result) => result.status === 'rejected')) {
    throw new Error('All configured watchlist pages were unavailable');
  }

  return mentions;
}

function deduplicate(mentions: ListeningMention[]): ListeningMention[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  return mentions.filter((mention) => {
    const urlKey = canonicalUrl(mention.url);
    const titleKey = normalize(mention.title);
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) return false;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    return true;
  });
}

export async function collectListeningMentions(): Promise<ListeningResponse> {
  const brand = process.env.LISTENING_BRAND_NAME?.trim() || 'Allianz-Synergia';
  const aliases = splitSetting(process.env.LISTENING_SEARCH_TERMS, DEFAULT_ALIASES);
  const exclusions = splitSetting(process.env.LISTENING_EXCLUDED_TERMS, DEFAULT_EXCLUSIONS);
  const alertFeeds = splitSetting(process.env.GOOGLE_ALERTS_RSS_URLS, []);
  const watchUrls = splitSetting(process.env.LISTENING_WATCH_URLS, DEFAULT_WATCH_URLS);
  const googleKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY?.trim() || '';
  const googleCx = process.env.GOOGLE_CUSTOM_SEARCH_CX?.trim() || '';
  const exactQuery = aliases
    .filter((alias) => !alias.includes(','))
    .slice(0, 3)
    .map((alias) => `\"${alias}\"`)
    .join(' OR ');
  const primaryAlias = aliases[0] || brand;
  const mentions: ListeningMention[] = [];
  const connectors: ListeningConnector[] = [];
  const warnings: string[] = [];

  const execute = async (
    id: string,
    label: string,
    detail: string,
    operation: () => Promise<ListeningMention[]>
  ) => {
    try {
      const results = await operation();
      mentions.push(...results);
      connectors.push({ id, label, state: 'live', count: results.length, detail });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connector error';
      connectors.push({ id, label, state: 'degraded', count: 0, detail: message });
      warnings.push(`${label}: ${message}`);
    }
  };

  await Promise.all([
    execute('google-news', 'Google News', 'Live exact-name results from Google News.', () => fetchGoogleNews(exactQuery)),
    execute('reddit', 'Reddit', 'Live public posts returned by Reddit search.', () => fetchReddit(primaryAlias)),
    execute('web-watchlist', 'Verified Web', 'Live pages from the approved Allianz-Synergia source watchlist.', () => fetchWatchedPages(watchUrls)),
  ]);

  if (alertFeeds.length) {
    await execute('google-alerts', 'Google Alerts', 'Configured Google Alerts RSS feeds.', () => fetchGoogleAlerts(alertFeeds));
  } else {
    connectors.push({
      id: 'google-alerts',
      label: 'Google Alerts',
      state: 'not_configured',
      count: 0,
      detail: 'Add GOOGLE_ALERTS_RSS_URLS to ingest broad Google web alerts.',
    });
  }

  if (googleKey && googleCx) {
    await execute('google-web', 'Google Web', 'Existing Google Custom Search account.', () => fetchGoogleWeb(exactQuery, googleKey, googleCx));
  } else {
    connectors.push({
      id: 'google-web',
      label: 'Google Web',
      state: 'not_configured',
      count: 0,
      detail: 'Optional for existing Custom Search customers; Google closed new API sign-ups.',
    });
  }

  const verifiedMentions = deduplicate(mentions)
    .filter((mention) => isBrandMatch(`${mention.title} ${mention.excerpt} ${mention.url}`, aliases, exclusions))
    .sort((left, right) => {
      const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
      const rightTime = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
      return rightTime - leftTime;
    });

  return {
    brand,
    aliases,
    generatedAt: new Date().toISOString(),
    googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(exactQuery)}`,
    mentions: verifiedMentions,
    connectors,
    warnings,
    summary: {
      total: verifiedMentions.length,
      google: verifiedMentions.filter((mention) => mention.discoveredBy.startsWith('Google')).length,
      social: verifiedMentions.filter((mention) => mention.channel === 'social').length,
      web: verifiedMentions.filter((mention) => mention.channel === 'web').length,
      positive: verifiedMentions.filter((mention) => mention.sentiment === 'positive').length,
      neutral: verifiedMentions.filter((mention) => mention.sentiment === 'neutral').length,
      negative: verifiedMentions.filter((mention) => mention.sentiment === 'negative').length,
      owned: verifiedMentions.filter((mention) => mention.isOwned).length,
    },
  };
}

export type { ListeningResponse } from './types';
