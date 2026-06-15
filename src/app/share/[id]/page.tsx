'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Loader2, Shield, Zap, Search, Download, Share2, Mail, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import Tooltip from '@/components/ui/tooltip';
import logoWhite from '../../../../logowhite.png';

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
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-black flex items-center justify-center relative overflow-hidden text-white">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-tufts/15 rounded-full blur-3xl animate-bg-shift"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-2xl bg-brand-black/20 px-3 py-2.5 backdrop-blur-md">
            <Image src={logoWhite} alt="WebSiteMonitoringMo" priority className="h-8 w-auto" />
          </div>
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-brand-orange" />
          <p className="mt-4 text-base md:text-lg font-semibold font-heading tracking-tight text-brand-powder">Loading dashboard...</p>
          <p className="mt-1 text-sm text-brand-powder/60">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-black flex items-center justify-center relative overflow-hidden text-white">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl animate-bg-shift"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-tufts/10 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-3 rounded-2xl bg-brand-black/20 px-3 py-2.5 backdrop-blur-md">
            <Image src={logoWhite} alt="WebSiteMonitoringMo" priority className="h-8 w-auto" />
          </div>
          <AlertCircle className="w-12 h-12 mx-auto text-brand-orange animate-pulse" />
          <p className="mt-4 text-base md:text-lg font-semibold font-heading tracking-tight text-brand-powder">{error || 'Website not found'}</p>
          <p className="mt-2 text-sm text-brand-powder/60">The shared dashboard is not available</p>
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
    if (score >= 80) return 'text-brand-tufts';
    if (score >= 60) return 'text-brand-orange';
    return 'text-brand-powder';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-brand-tufts/20 to-brand-tufts/10 border-brand-tufts/30';
    if (score >= 60) return 'from-brand-orange/20 to-brand-orange/10 border-brand-orange/30';
    return 'from-brand-powder/10 to-brand-powder/5 border-brand-powder/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-black text-white p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-tufts/10 rounded-full blur-3xl animate-bg-shift"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-brand-navy/30 rounded-full blur-3xl animate-bg-shift" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Brand Mark */}
        <div className="flex justify-end mb-5">
          <div className="inline-flex items-center rounded-2xl bg-brand-black/20 backdrop-blur-md px-3 py-2.5 shadow-lg shadow-brand-black/20">
            <Image
              src={logoWhite}
              alt="WebSiteMonitoringMo"
              priority
              className="h-9 w-auto md:h-10"
            />
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10 animate-slide-up animate-slide-up-1">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-black/30 backdrop-blur-sm px-3.5 py-2 rounded-full mb-5 border border-brand-tufts/20 hover:border-brand-tufts/50 transition-colors">
            <div className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm tracking-wide text-brand-powder/90 font-medium uppercase">Live Monitoring Dashboard</span>
          </div>

          {/* Main Title with Animation */}
          <h1 className="mx-auto max-w-4xl text-4xl md:text-6xl font-bold font-heading tracking-tight leading-none bg-gradient-to-r from-brand-orange via-brand-powder to-brand-tufts bg-clip-text text-transparent mb-3 animate-gradient-x bg-size-200">
            {website.displayName}
          </h1>
          <p className="text-brand-tufts/90 text-base md:text-xl font-light tracking-[0.12em] uppercase">{website.domain}</p>
          
          {/* Last Update Info */}
          <div className="flex items-center justify-center gap-2 text-brand-powder/60 text-xs md:text-sm mt-4 bg-brand-black/25 backdrop-blur-sm px-3.5 py-2 rounded-lg mx-auto border border-brand-tufts/10">
            <Clock className="w-4 h-4" />
            <span>Last updated: {website.lastScanAt ? new Date(website.lastScanAt).toLocaleString() : 'Never scanned'}</span>
          </div>
        </div>

        {/* Main Score Cards with Floating Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
          {/* Site Health - Floating */}
          <div className={`bg-gradient-to-br ${getScoreBg(seo.siteHealthScore)} backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-brand-powder/15 transition-all hover:border-brand-tufts/50 animate-float animate-slide-up-2`}>
            <div className="flex items-center gap-3 mb-3.5">
              <div className="p-2.5 bg-brand-tufts/10 rounded-xl border border-brand-tufts/20">
                <Search className="w-6 h-6 text-brand-tufts" />
              </div>
              <Tooltip content="Overall SEO health score. 80+: Excellent, 60-79: Good, Below 60: Needs improvement">
                <span className="text-brand-powder/80 text-sm md:text-base font-medium cursor-help tracking-wide">Site Health</span>
              </Tooltip>
            </div>
            <div className={`text-4xl md:text-5xl font-bold tracking-tight ${getScoreColor(seo.siteHealthScore)} animate-glow-pulse`}>
              {seo.siteHealthScore}%
            </div>
            <div className="mt-4 h-2 bg-brand-powder/10 rounded-full overflow-hidden border border-brand-powder/20">
              <div 
                className={`h-full ${seo.siteHealthScore >= 80 ? 'bg-gradient-to-r from-brand-tufts to-brand-tufts/70' : seo.siteHealthScore >= 60 ? 'bg-gradient-to-r from-brand-orange to-brand-orange/70' : 'bg-gradient-to-r from-brand-powder to-brand-powder/70'} rounded-full transition-all duration-1000`}
                style={{ width: `${seo.siteHealthScore}%` }}
              ></div>
            </div>
          </div>

          {/* Security - Floating Delayed */}
          <div className={`bg-gradient-to-br ${getScoreBg(security.securityRating / 9.5)} backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-brand-powder/15 transition-all hover:border-brand-orange/50 animate-float animate-float-delayed animate-slide-up-3`}>
            <div className="flex items-center gap-3 mb-3.5">
              <div className="p-2.5 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
                <Shield className="w-6 h-6 text-brand-orange" />
              </div>
              <Tooltip content="Security rating out of 950. Based on SSL, HTTPS, CSP, HSTS and other security headers. Higher is better.">
                <span className="text-brand-powder/80 text-sm md:text-base font-medium cursor-help tracking-wide">Security Rating</span>
              </Tooltip>
            </div>
            <div className={`text-4xl md:text-5xl font-bold tracking-tight ${getScoreColor(security.securityRating / 9.5)} animate-glow-pulse`}>
              {security.securityRating}
            </div>
            <p className="text-brand-powder/40 text-xs md:text-sm mt-1 uppercase tracking-[0.2em]">out of 950</p>
            <div className="mt-4 h-2 bg-brand-powder/10 rounded-full overflow-hidden border border-brand-powder/20">
              <div 
                className={`h-full bg-gradient-to-r from-brand-orange to-brand-orange/70 rounded-full transition-all duration-1000`}
                style={{ width: `${(security.securityRating / 950) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Performance - Floating More Delayed */}
          <div className={`bg-gradient-to-br ${getScoreBg(perf.performanceScore)} backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-brand-powder/15 transition-all hover:border-brand-powder/50 animate-float animate-float-more-delayed animate-slide-up-4`}>
            <div className="flex items-center gap-3 mb-3.5">
              <div className="p-2.5 bg-brand-powder/10 rounded-xl border border-brand-powder/20">
                <Zap className="w-6 h-6 text-brand-powder" />
              </div>
              <Tooltip content="Page speed score (0-100). Based on Core Web Vitals: FCP, LCP, CLS, and speed index. 80+: Excellent, 60-79: Good, Below 60: Needs work">
                <span className="text-brand-powder/80 text-sm md:text-base font-medium cursor-help tracking-wide">Performance</span>
              </Tooltip>
            </div>
            <div className={`text-4xl md:text-5xl font-bold tracking-tight ${getScoreColor(perf.performanceScore)} animate-glow-pulse`}>
              {perf.performanceScore}
            </div>
            <p className="text-brand-powder/40 text-xs md:text-sm mt-1 uppercase tracking-[0.2em]">out of 100</p>
            <div className="mt-4 h-2 bg-brand-powder/10 rounded-full overflow-hidden border border-brand-powder/20">
              <div 
                className={`h-full bg-gradient-to-r from-brand-orange to-brand-tufts rounded-full transition-all duration-1000`}
                style={{ width: `${perf.performanceScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid with Staggered Animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-7">
          <div className="bg-brand-black/20 backdrop-blur-sm rounded-xl p-4 border border-brand-tufts/10 hover:border-brand-tufts/30 transition-colors animate-slide-up-1 animate-slide-up">
            <Tooltip content="AI model's assessment of your site's SEO health. Higher scores indicate better search visibility">
              <p className="text-brand-powder/60 text-sm cursor-help">AI Search Health</p>
            </Tooltip>
            <p className={`text-2xl md:text-3xl font-bold mt-2 tracking-tight ${getScoreColor(seo.aiSearchHealth)}`}>{seo.aiSearchHealth}%</p>
          </div>
          <div className="bg-brand-black/20 backdrop-blur-sm rounded-xl p-4 border border-brand-tufts/10 hover:border-brand-tufts/30 transition-colors animate-slide-up-2 animate-slide-up">
            <Tooltip content="How easily search engines can crawl and index your website. Higher is better.">
              <p className="text-brand-powder/60 text-sm cursor-help">Crawlability</p>
            </Tooltip>
            <p className={`text-2xl md:text-3xl font-bold mt-2 tracking-tight ${getScoreColor(seo.crawlability)}`}>{seo.crawlability}%</p>
          </div>
          <div className="bg-brand-black/20 backdrop-blur-sm rounded-xl p-4 border border-brand-tufts/10 hover:border-brand-tufts/30 transition-colors animate-slide-up-3 animate-slide-up">
            <Tooltip content="Quality and structure of links within your website. Helps distribute page authority and improves navigation.">
              <p className="text-brand-powder/60 text-sm cursor-help">Internal Linking</p>
            </Tooltip>
            <p className={`text-2xl md:text-3xl font-bold mt-2 tracking-tight ${getScoreColor(seo.internalLinking)}`}>{seo.internalLinking}%</p>
          </div>
          <div className="bg-brand-black/20 backdrop-blur-sm rounded-xl p-4 border border-brand-tufts/10 hover:border-brand-tufts/30 transition-colors animate-slide-up-4 animate-slide-up">
            <Tooltip content="Number of pages successfully indexed by search engines">
              <p className="text-brand-powder/60 text-sm cursor-help">Pages Crawled</p>
            </Tooltip>
            <p className="text-2xl md:text-3xl font-bold mt-2 tracking-tight text-brand-tufts">{seo.pagesCrawled} / {seo.totalPages}</p>
          </div>
        </div>

        {/* Security Details - Animated Card */}
        <div className="bg-brand-black/20 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-brand-orange/10 hover:border-brand-orange/30 transition-colors mb-7 animate-slide-up-5 animate-slide-up">
          <h3 className="text-lg md:text-xl font-semibold font-heading mb-4 flex items-center gap-2 tracking-tight">
            <Shield className="w-5 h-5 text-brand-orange" />
            Security Checklist
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              {security.httpsStatus ? (
                <CheckCircle className="w-5 h-5 text-brand-tufts" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brand-orange" />
              )}
              <Tooltip content="Secure connection protocol. Essential for protecting user data in transit.">
                <span className="text-brand-powder/80 cursor-help">HTTPS</span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              {'sslCertificateValid' in security && security.sslCertificateValid ? (
                <CheckCircle className="w-5 h-5 text-brand-tufts" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brand-orange" />
              )}
              <Tooltip content="Valid SSL certificate enables HTTPS and ensures encrypted communication with visitors.">
                <span className="text-brand-powder/80 cursor-help">SSL Certificate</span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              {'hasCSP' in security && security.hasCSP ? (
                <CheckCircle className="w-5 h-5 text-brand-tufts" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brand-orange" />
              )}
              <Tooltip content="Content Security Policy prevents XSS attacks by controlling resource loading.">
                <span className="text-brand-powder/80 cursor-help">CSP Header</span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              {'hasHSTS' in security && security.hasHSTS ? (
                <CheckCircle className="w-5 h-5 text-brand-tufts" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brand-orange" />
              )}
              <Tooltip content="HTTP Strict Transport Security forces HTTPS connections for enhanced security.">
                <span className="text-brand-powder/80 cursor-help">HSTS</span>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Business Dev CTA Section */}
        <div className="bg-gradient-to-r from-brand-black/30 via-brand-navy/35 to-brand-tufts/15 backdrop-blur-sm rounded-2xl p-6 md:p-7 border border-brand-tufts/25 mb-7 animate-slide-up-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
              className="flex items-center justify-center gap-2 bg-brand-tufts text-brand-powder border border-brand-tufts/70 hover:brightness-110 rounded-lg py-3 px-4 transition-all duration-300 group shadow-lg shadow-brand-tufts/20"
            >
              <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium tracking-wide">Share Dashboard</span>
            </button>

            {/* Download Report */}
            <button 
              onClick={() => alert('PDF export feature coming soon!')}
              className="flex items-center justify-center gap-2 bg-brand-orange text-brand-powder border border-brand-orange/70 hover:brightness-110 rounded-lg py-3 px-4 transition-all duration-300 group shadow-lg shadow-brand-orange/20"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="font-medium tracking-wide">Download Report</span>
            </button>

            {/* Contact Sales */}
            <button 
              onClick={() => alert('Opening contact form...')}
              className="flex items-center justify-center gap-2 bg-brand-powder/10 hover:bg-brand-powder/15 border border-brand-powder/20 hover:border-brand-powder/40 rounded-lg py-3 px-4 transition-all duration-300 group"
            >
              <Mail className="w-5 h-5 text-brand-powder group-hover:scale-110 transition-transform" />
              <span className="font-medium tracking-wide">Contact Our Team</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-brand-powder/50 text-sm border-t border-brand-tufts/10 pt-7 animate-slide-up-7 animate-slide-up">
          <p className="font-medium tracking-wide">Powered by <span className="text-brand-orange">WebSiteMonitoringMo</span></p>
          <p className="mt-2 text-brand-powder/70 text-sm">Real-time website monitoring & analysis platform</p>
          <p className="text-xs text-brand-powder/30 mt-3">© 2026 WebSiteMonitoringMo. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
