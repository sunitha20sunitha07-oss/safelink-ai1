/**
 * SafeLink AI - Shared 13-Feature Extractor
 * Shared between the real ML training pipeline and live frontend inference.
 * Guarantees 100% mathematical parity: the exact same vector computation is used
 * in both training on the labelled dataset and in-browser predictions.
 */

export interface ExtractedFeatureVector {
  vector: number[]; // Exact 13-element numerical vector
  values: {
    urlLength: number;
    hostnameLength: number;
    dotsHostname: number;
    dotsUrl: number;
    hyphensHostname: number;
    hyphensUrl: number;
    isIpHostname: number;
    hasAtSymbol: number;
    hasPunycode: number;
    isHttps: number;
    keywordCount: number;
    subdomainDepth: number;
    hostnameEntropy: number;
  };
  hostname: string;
  subdomain: string;
  rootDomain: string;
  tld: string;
  matchedKeywords: string[];
}

export const FEATURE_METADATA = [
  { id: 'url_length', name: 'URL Length', desc: 'Total character length of the address' },
  { id: 'hostname_length', name: 'Hostname Length', desc: 'Total character length of the host' },
  { id: 'dots_hostname', name: 'Dots in Hostname', desc: 'Period delimiters in host' },
  { id: 'dots_url', name: 'Dots in URL', desc: 'Total period count in full URL string' },
  { id: 'hyphens_hostname', name: 'Hyphens in Hostname', desc: 'Hyphens used in host domain' },
  { id: 'hyphens_url', name: 'Hyphens in URL', desc: 'Total hyphens in full address' },
  { id: 'is_ip_hostname', name: 'IP Address as Host', desc: 'Numeric IP bypassing standard DNS' },
  { id: 'has_at_symbol', name: '@ Symbol in URL', desc: 'Userinfo delimiter masking true destination' },
  { id: 'has_punycode', name: 'Punycode Homoglyph', desc: 'Lookalike character encoding (xn--)' },
  { id: 'is_https', name: 'HTTPS Transport', desc: 'Transport layer scheme (1 for https, 0 for http)' },
  { id: 'keyword_count', name: 'Security Keywords', desc: 'Lure words like login, verify, wallet, secure' },
  { id: 'subdomain_depth', name: 'Subdomain Depth', desc: 'Count of nested subdomain prefixes' },
  { id: 'hostname_entropy', name: 'Hostname Entropy', desc: 'Shannon character entropy in domain' },
] as const;

export const SUSPICIOUS_KEYWORDS = [
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
] as const;

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

/**
 * Computes Shannon entropy of a string: H = -sum(p_i * log2(p_i))
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  const len = str.length;
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  // Round to 4 decimal places
  return Math.round(entropy * 10000) / 10000;
}

/**
 * Extracts the 13 numerical features and structural properties from any URL string.
 */
export function extract13Features(rawUrl: string): ExtractedFeatureVector | null {
  const trimmed = rawUrl.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return null;
  }

  let normalized = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    normalized = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }

  const hostname = (parsed.hostname || '').toLowerCase();
  if (!hostname) return null;

  // 1. IP check
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname.split('.').every(num => {
    const n = parseInt(num, 10);
    return n >= 0 && n <= 255;
  });
  const isIpv6 = /^\[?[0-9a-fA-F:]+\]?$/.test(hostname) && hostname.includes(':');
  const isIp = isIpv4 || isIpv6 ? 1 : 0;

  // 2. Punycode check
  const hostParts = hostname.split('.');
  const hasPunycode = hostParts.some(p => p.startsWith('xn--')) ? 1 : 0;

  // 3. Subdomain and Domain parsing
  let subdomain = 'None';
  let rootDomain = hostname;
  let tld = '';
  let subdomainDepth = 0;

  if (isIp || hostname === 'localhost') {
    subdomainDepth = 0;
    tld = isIp ? 'IP' : 'local';
  } else if (hostParts.length > 1) {
    const lastTwo = hostParts.slice(-2).join('.');
    if (COMMON_COMPOUND_TLDS.includes(lastTwo) && hostParts.length >= 3) {
      tld = '.' + lastTwo;
      rootDomain = hostParts.slice(-3).join('.');
      const subs = hostParts.slice(0, -3);
      subdomainDepth = subs.length;
      subdomain = subs.length > 0 ? subs.join('.') : 'None';
    } else {
      tld = '.' + hostParts[hostParts.length - 1];
      rootDomain = hostParts.slice(-2).join('.');
      const subs = hostParts.slice(0, -2);
      subdomainDepth = subs.length;
      subdomain = subs.length > 0 ? subs.join('.') : 'None';
    }
  }

  // 4. Character counts
  const urlLength = trimmed.length;
  const hostnameLength = hostname.length;
  const dotsHostname = (hostname.match(/\./g) || []).length;
  const dotsUrl = (trimmed.match(/\./g) || []).length;
  const hyphensHostname = (hostname.match(/-/g) || []).length;
  const hyphensUrl = (trimmed.match(/-/g) || []).length;

  // 5. Userinfo / @ symbol check
  const hasAtSymbol = trimmed.includes('@') || parsed.username !== '' || parsed.password !== '' ? 1 : 0;

  // 6. HTTPS check
  const isHttps = parsed.protocol === 'https:' ? 1 : 0;

  // 7. Keyword matching
  const fullSearchString = (parsed.hostname + parsed.pathname + parsed.search).toLowerCase();
  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter(kw => {
    const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i');
    return regex.test(fullSearchString) || fullSearchString.includes(kw);
  });
  const keywordCount = matchedKeywords.length;

  // 8. Shannon entropy of hostname
  const hostnameEntropy = calculateShannonEntropy(hostname);

  // Exact 13-feature numerical vector
  const vector = [
    urlLength,
    hostnameLength,
    dotsHostname,
    dotsUrl,
    hyphensHostname,
    hyphensUrl,
    isIp,
    hasAtSymbol,
    hasPunycode,
    isHttps,
    keywordCount,
    subdomainDepth,
    hostnameEntropy,
  ];

  return {
    vector,
    values: {
      urlLength,
      hostnameLength,
      dotsHostname,
      dotsUrl,
      hyphensHostname,
      hyphensUrl,
      isIpHostname: isIp,
      hasAtSymbol,
      hasPunycode,
      isHttps,
      keywordCount,
      subdomainDepth,
      hostnameEntropy,
    },
    hostname,
    subdomain,
    rootDomain,
    tld,
    matchedKeywords: [...matchedKeywords],
  };
}
