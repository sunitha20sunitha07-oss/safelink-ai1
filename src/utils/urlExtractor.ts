/**
 * SafeLink AI - Deterministic URL Feature Extraction
 * Extracts visible lexical and structural characteristics safely without making synthetic ML verdicts.
 */

import { UrlFeatures } from '../types';

// Common multi-part public suffixes for domain splitting
const COMMON_COMPOUND_TLDS = [
  'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
  'edu.in', 'gov.in', 'res.in', 'ac.in', 'co.in', 'org.in', 'net.in',
  'com.au', 'net.au', 'org.au', 'edu.au',
  'co.jp', 'ne.jp', 'ac.jp',
  'com.br', 'org.br', 'gov.br',
  'co.nz', 'org.nz',
  'com.sg', 'edu.sg',
  'com.my', 'edu.my',
];

// Targeted keywords commonly associated with authentication or account manipulation
export const TARGET_KEYWORDS = [
  'login',
  'verify',
  'update',
  'wallet',
  'secure',
  'account',
  'signin',
  'banking',
  'confirm',
  'security',
  'auth',
  'recover',
  'password',
  'credential',
];

/**
 * Validates and extracts features from a raw URL string
 */
export function extractUrlFeatures(rawInput: string): { features?: UrlFeatures; error?: string } {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return { error: 'Please enter a website URL to extract features.' };
  }

  // Reject URLs containing spaces
  if (/\s/.test(trimmed)) {
    return { error: 'Invalid URL: The address contains spaces, which is not permitted in valid web links.' };
  }

  // Handle missing protocol safely (default to https:// for structural parsing)
  let normalizedInput = trimmed;
  let hasExplicitProtocol = false;

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    hasExplicitProtocol = true;
  } else {
    normalizedInput = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedInput);
  } catch {
    return {
      error: 'Invalid URL format: Unable to parse URL structure. Ensure it follows a standard format like "example.com" or "https://domain.tld".',
    };
  }

  // Verify hostname exists
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname.length === 0) {
    return { error: 'Invalid URL format: No valid hostname could be identified.' };
  }

  // Ensure hostname has at least one dot unless it is localhost or valid IP
  const isLocalhost = hostname === 'localhost';
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname.split('.').every(num => {
    const n = parseInt(num, 10);
    return n >= 0 && n <= 255;
  });
  const isIpv6 = /^\[?[0-9a-fA-F:]+\]?$/.test(hostname) && hostname.includes(':');
  const isIp = isIpv4 || isIpv6;

  if (!isLocalhost && !isIp && !hostname.includes('.')) {
    return {
      error: 'Invalid domain: Hostname must contain a valid domain extension (e.g. .com, .edu, .org).',
    };
  }

  // Domain & Subdomain structure extraction
  const domainStructure = parseDomainStructure(hostname, isIp);

  // Character counts
  const dotsInHostname = (hostname.match(/\./g) || []).length;
  const dotsInUrl = (trimmed.match(/\./g) || []).length;
  const hyphensInHostname = (hostname.match(/-/g) || []).length;
  const hyphensInUrl = (trimmed.match(/-/g) || []).length;

  // Check for @ symbol (obfuscation vector in URLs)
  const hasAtSymbol = trimmed.includes('@') || parsed.username !== '' || parsed.password !== '';

  // Check for Punycode labels (starts with xn--)
  const hostnameParts = hostname.split('.');
  const punycodeLabels = hostnameParts.filter(part => part.startsWith('xn--'));
  const hasPunycode = punycodeLabels.length > 0;

  // Search for targeted keywords across hostname and path/query
  const urlLower = (parsed.hostname + parsed.pathname + parsed.search).toLowerCase();
  const matchedKeywords = TARGET_KEYWORDS.filter(kw => {
    // Word boundary or separator-bounded match for cleaner detection
    const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i');
    return regex.test(urlLower) || urlLower.includes(kw);
  });

  const features: UrlFeatures = {
    rawUrl: trimmed,
    normalizedUrl: parsed.href,
    protocol: parsed.protocol,
    isHttps: parsed.protocol === 'https:',
    hostname,
    port: parsed.port || undefined,
    pathname: parsed.pathname,
    search: parsed.search,
    hash: parsed.hash,
    domainStructure,
    urlLength: trimmed.length,
    dotsInHostname,
    dotsInUrl,
    hyphensInHostname,
    hyphensInUrl,
    isIpHostname: isIp,
    ipType: isIpv4 ? 'IPv4' : isIpv6 ? 'IPv6' : null,
    hasAtSymbol,
    hasPunycode,
    punycodeLabels,
    matchedKeywords,
    analyzedAt: new Date(),
  };

  return { features };
}

/**
 * Splits hostname into root domain, subdomain, and TLD
 */
function parseDomainStructure(hostname: string, isIp: boolean): {
  tld: string;
  rootDomain: string;
  subdomain: string;
  fullHostname: string;
} {
  if (isIp || hostname === 'localhost') {
    return {
      tld: isIp ? 'N/A (Direct IP)' : 'N/A (Localhost)',
      rootDomain: hostname,
      subdomain: 'None',
      fullHostname: hostname,
    };
  }

  const parts = hostname.split('.');
  if (parts.length <= 1) {
    return {
      tld: '',
      rootDomain: hostname,
      subdomain: 'None',
      fullHostname: hostname,
    };
  }

  // Check compound TLDs like co.uk or edu.in
  let tld = parts[parts.length - 1];
  let rootDomain = '';
  let subdomain = 'None';

  const lastTwo = parts.slice(-2).join('.');
  if (COMMON_COMPOUND_TLDS.includes(lastTwo) && parts.length >= 3) {
    tld = '.' + lastTwo;
    rootDomain = parts.slice(-3).join('.');
    const subParts = parts.slice(0, -3);
    subdomain = subParts.length > 0 ? subParts.join('.') : 'None';
  } else {
    tld = '.' + parts[parts.length - 1];
    rootDomain = parts.slice(-2).join('.');
    const subParts = parts.slice(0, -2);
    subdomain = subParts.length > 0 ? subParts.join('.') : 'None';
  }

  return {
    tld,
    rootDomain,
    subdomain,
    fullHostname: hostname,
  };
}
