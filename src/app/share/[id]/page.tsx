'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Shield, Zap, Search, Download, Share2, Mail, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import Tooltip from '@/components/ui/tooltip';

// This is a public page - no authentication required

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

export default function PublicDashboard() {
  const params = useParams();
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const res = await fetch(`/api/public/websites/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setWebsite(data);
        } else {
          setError('Website not found');
        }
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchWebsite();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-bg-shift"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative text-center text-white z-10">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-400" />
          <p className="mt-4 text-lg font-medium">Loading dashboard...</p>
          <p className="text-white/50 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-bg-shift"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative text-center text-white z-10">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 animate-pulse" />
          <p className="mt-4 text-lg font-medium">{error || 'Website not found'}</p>
          <p className="text-white/50 text-sm mt-2">The shared dashboard is not available</p>
        </div>
      </div>
    );
  }

  const seo = website.seoMetrics || {
    siteHealthScore: 0,
    aiSearchHealth: 0,
    crawlability: 0,
    internalLinking: 0,
    totalPages: 0,
    pagesCrawled: 0,
  };

  const security = website.securityMetrics || {
    securityRating: 0,
    httpsStatus: false,
  };

  const perf = website.analytics || {
    performanceScore: 0,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-600/10 border-green-500/30';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    return 'from-red-500/20 to-red-600/10 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-bg-shift"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-slide-up animate-slide-up-1">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20 hover:border-blue-400/50 transition-colors">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/80 font-medium">Live Monitoring Dashboard</span>
          </div>

          {/* Main Title with Animation */}
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2 animate-gradient-x bg-size-200">
            {website.displayName}
          </h1>
          <p className="text-blue-300/90 mt-2 text-xl font-light tracking-wide">{website.domain}</p>
          
          {/* Last Update Info */}
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm mt-4 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg mx-auto border border-white/10">
            <Clock className="w-4 h-4" />
            <span>Last updated: {website.lastScanAt ? new Date(website.lastScanAt).toLocaleString() : 'Never scanned'}</span>
          </div>
        </div>

        {/* Main Score Cards with Floating Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Site Health - Floating */}
          <div className={`bg-gradient-to-br ${getScoreBg(seo.siteHealthScore)} backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all hover:border-blue-400/50 animate-float animate-slide-up-2`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
              <Tooltip content="Overall SEO health score. 80+: Excellent, 60-79: Good, Below 60: Needs improvement">
                <span className="text-white/80 font-medium cursor-help">Site Health</span>
              </Tooltip>
            </div>
            <div className={`text-5xl font-bold ${getScoreColor(seo.siteHealthScore)} animate-glow-pulse`}>
              {seo.siteHealthScore}%
            </div>
            <div className="mt-4 h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <div 
                className={`h-full ${seo.siteHealthScore >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : seo.siteHealthScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-rose-500'} rounded-full transition-all duration-1000`}
                style={{ width: `${seo.siteHealthScore}%` }}
              ></div>
            </div>
          </div>

          {/* Security - Floating Delayed */}
          <div className={`bg-gradient-to-br ${getScoreBg(security.securityRating / 9.5)} backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all hover:border-purple-400/50 animate-float animate-float-delayed animate-slide-up-3`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <Tooltip content="Security rating out of 950. Based on SSL, HTTPS, CSP, HSTS and other security headers. Higher is better.">
                <span className="text-white/80 font-medium cursor-help">Security Rating</span>
              </Tooltip>
            </div>
            <div className={`text-5xl font-bold ${getScoreColor(security.securityRating / 9.5)} animate-glow-pulse`}>
              {security.securityRating}
            </div>
            <p className="text-white/40 text-sm mt-1">out of 950</p>
            <div className="mt-4 h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <div 
                className={`h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000`}
                style={{ width: `${(security.securityRating / 950) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Performance - Floating More Delayed */}
          <div className={`bg-gradient-to-br ${getScoreBg(perf.performanceScore)} backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all hover:border-yellow-400/50 animate-float animate-float-more-delayed animate-slide-up-4`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <Tooltip content="Page speed score (0-100). Based on Core Web Vitals: FCP, LCP, CLS, and speed index. 80+: Excellent, 60-79: Good, Below 60: Needs work">
                <span className="text-white/80 font-medium cursor-help">Performance</span>
              </Tooltip>
            </div>
            <div className={`text-5xl font-bold ${getScoreColor(perf.performanceScore)} animate-glow-pulse`}>
              {perf.performanceScore}
            </div>
            <p className="text-white/40 text-sm mt-1">out of 100</p>
            <div className="mt-4 h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/20">
              <div 
                className={`h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000`}
                style={{ width: `${perf.performanceScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid with Staggered Animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-blue-400/30 transition-colors animate-slide-up-1 animate-slide-up">
            <Tooltip content="AI model's assessment of your site's SEO health. Higher scores indicate better search visibility">
              <p className="text-white/60 text-sm cursor-help">AI Search Health</p>
            </Tooltip>
            <p className={`text-3xl font-bold mt-2 ${getScoreColor(seo.aiSearchHealth)}`}>{seo.aiSearchHealth}%</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-blue-400/30 transition-colors animate-slide-up-2 animate-slide-up">
            <Tooltip content="How easily search engines can crawl and index your website. Higher is better.">
              <p className="text-white/60 text-sm cursor-help">Crawlability</p>
            </Tooltip>
            <p className={`text-3xl font-bold mt-2 ${getScoreColor(seo.crawlability)}`}>{seo.crawlability}%</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-blue-400/30 transition-colors animate-slide-up-3 animate-slide-up">
            <Tooltip content="Quality and structure of links within your website. Helps distribute page authority and improves navigation.">
              <p className="text-white/60 text-sm cursor-help">Internal Linking</p>
            </Tooltip>
            <p className={`text-3xl font-bold mt-2 ${getScoreColor(seo.internalLinking)}`}>{seo.internalLinking}%</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-blue-400/30 transition-colors animate-slide-up-4 animate-slide-up">
            <Tooltip content="Number of pages successfully indexed by search engines">
              <p className="text-white/60 text-sm cursor-help">Pages Crawled</p>
            </Tooltip>
            <p className="text-3xl font-bold mt-2 text-blue-400">{seo.pagesCrawled} / {seo.totalPages}</p>
          </div>
        </div>

        {/* Security Details - Animated Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-colors mb-8 animate-slide-up-5 animate-slide-up">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Security Checklist
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {security.httpsStatus ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <Tooltip content="Secure connection protocol. Essential for protecting user data in transit.">
                <span className="text-white/80 cursor-help">HTTPS</span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              {'sslCertificateValid' in security && security.sslCertificateValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <Tooltip content="Valid SSL certificate enables HTTPS and ensures encrypted communication with visitors.">
                <span className="text-white/80 cursor-help">SSL Certificate</span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              {'hasCSP' in security && security.hasCSP ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
              <Tooltip content="Content Security Policy prevents XSS attacks by controlling resource loading.">
                <span className="text-white/80 cursor-help">CSP Header</span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              {'hasHSTS' in security && security.hasHSTS ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
              <Tooltip content="HTTP Strict Transport Security forces HTTPS connections for enhanced security.">
                <span className="text-white/80 cursor-help">HSTS</span>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Business Dev CTA Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-400/30 mb-8 animate-slide-up-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Share Button */}
            <button 
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: `${website.displayName} - WebSiteMonitoringMo Dashboard`,
                    text: `Check out the monitoring dashboard for ${website.displayName}`,
                    url: url
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 hover:border-blue-300 rounded-lg py-3 px-4 transition-all duration-300 group"
            >
              <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Share Dashboard</span>
            </button>

            {/* Download Report */}
            <button 
              onClick={() => alert('PDF export feature coming soon!')}
              className="flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/50 hover:border-purple-300 rounded-lg py-3 px-4 transition-all duration-300 group"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="font-medium">Download Report</span>
            </button>

            {/* Contact Sales */}
            <button 
              onClick={() => alert('Opening contact form...')}
              className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/40 border border-green-400/50 hover:border-green-300 rounded-lg py-3 px-4 transition-all duration-300 group"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Contact Our Team</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/40 text-sm border-t border-white/10 pt-8 animate-slide-up-7 animate-slide-up">
          <p className="font-medium">Powered by <span className="text-blue-400">WebSiteMonitoringMo</span></p>
          <p className="mt-2">Real-time website monitoring & analysis platform</p>
          <p className="text-xs text-white/30 mt-3">© 2026 WebSiteMonitoringMo. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
