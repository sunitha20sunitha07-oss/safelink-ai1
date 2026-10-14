/**
 * SafeLink AI - Data contracts & analysis types
 * Designed for clean extensibility when ML models and APIs are integrated in subsequent phases.
 */

import { MLPrediction } from './ml/predictor';

export interface UrlFeatures {
  // Core URL parsing
  rawUrl: string;
  normalizedUrl: string;
  protocol: string;
  isHttps: boolean;
  hostname: string;
  port?: string;
  pathname: string;
  search: string;
  hash: string;

  // Domain structure
  domainStructure: {
    tld: string;
    rootDomain: string;
    subdomain: string;
    fullHostname: string;
  };

  // Metrics & counts
  urlLength: number;
  dotsInHostname: number;
  dotsInUrl: number;
  hyphensInHostname: number;
  hyphensInUrl: number;

  // Structural indicators
  isIpHostname: boolean;
  ipType?: 'IPv4' | 'IPv6' | null;
  hasAtSymbol: boolean;
  hasPunycode: boolean;
  punycodeLabels: string[];
  matchedKeywords: string[];

  // Extracted timestamp
  analyzedAt: Date;
}

export interface UrlSubmission {
  rawUrl: string;
  submittedAt: Date;
  protocol?: string;
  hostname?: string;
  pathname?: string;
  features?: UrlFeatures;
  prediction?: MLPrediction;
  error?: string;
}

export interface ReservedModuleInfo {
  id: string;
  title: string;
  subtitle: string;
  status: 'reserved' | 'pending_integration';
  plannedFeatures: string[];
  description: string;
}
