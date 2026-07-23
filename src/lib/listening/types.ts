export type ListeningChannel = 'google' | 'social' | 'web';
export type SentimentLabel = 'positive' | 'neutral' | 'negative';
export type ConnectorState = 'live' | 'degraded' | 'not_configured';

export interface ListeningMention {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  source: string;
  publisher: string;
  discoveredBy: string;
  channel: ListeningChannel;
  publishedAt: string | null;
  author: string | null;
  sentiment: SentimentLabel;
  sentimentScore: number;
  engagement: {
    score?: number;
    comments?: number;
  } | null;
  isOwned: boolean;
}

export interface ListeningConnector {
  id: string;
  label: string;
  state: ConnectorState;
  count: number;
  detail: string;
}

export interface ListeningResponse {
  brand: string;
  aliases: string[];
  generatedAt: string;
  googleSearchUrl: string;
  mentions: ListeningMention[];
  connectors: ListeningConnector[];
  warnings: string[];
  summary: {
    total: number;
    google: number;
    social: number;
    web: number;
    positive: number;
    neutral: number;
    negative: number;
    owned: number;
  };
}
