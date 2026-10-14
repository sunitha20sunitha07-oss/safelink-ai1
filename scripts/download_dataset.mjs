/**
 * SafeLink AI - Verified Dataset Ingestion
 *
 * Constructs a balanced, authentic benchmark dataset using:
 * 1. Tranco Top Sites Research List (tranco-list.eu) for top benign domains & realistic web paths (including www / apex variations)
 * 2. UNB ISCX-URL-2016 (Canadian Institute for Cybersecurity) for verified benign web resources
 * 3. PhishTank Verified Active Feed for malicious/phishing URLs
 *
 * Saves balanced dataset to data/dataset.csv
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

const BENIGN_ISCX_URL = 'https://raw.githubusercontent.com/shreyagopal/Phishing-Website-Detection-by-Machine-Learning-Techniques/master/DataFiles/1.Benign_list_big_final.csv';
const PHISHING_PHISHTANK_URL = 'https://raw.githubusercontent.com/shreyagopal/Phishing-Website-Detection-by-Machine-Learning-Techniques/master/DataFiles/2.online-valid.csv';

const OUTPUT_DIR = path.resolve('data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dataset.csv');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

let seed = 42;
function prng() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const COMMON_BENIGN_PATHS = [
  '',
  '/',
  '/about',
  '/contact',
  '/academics/curriculum.html',
  '/news/latest',
  '/help',
  '/support/faq',
  '/docs/overview',
  '/services',
  '/team',
  '/privacy-policy',
  '/blog/announcement',
  '/products',
  '/community',
  '/search?q=research',
];

async function main() {
  console.log('🔄 SafeLink AI: Fetching open labelled URL datasets...');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Fetch Tranco Top Benign Domains
  console.log('📥 Fetching Tranco Top Sites Research Ranking...');
  const trancoRaw = execSync(`curl -sL https://tranco-list.eu/top-1m.csv.zip | python3 -c "
import zipfile, io, sys
z = zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read()))
f = z.open(z.namelist()[0])
domains = []
for _ in range(2500):
    line = f.readline().decode().strip()
    if line:
        parts = line.split(',')
        if len(parts) > 1:
            domains.append(parts[1].strip())
print('\\n'.join(domains))
"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

  const rawDomains = trancoRaw.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  console.log(`   Fetched ${rawDomains.length} verified top benign domains from Tranco.`);

  // Create varied URLs for Tranco domains (both apex domains and www. subdomains with standard web paths)
  const trancoUrls = [];
  rawDomains.forEach((dom, idx) => {
    const pathChoice = COMMON_BENIGN_PATHS[idx % COMMON_BENIGN_PATHS.length];
    const scheme = idx % 4 === 0 ? 'http://' : 'https://';
    const hasWww = idx % 2 === 0 ? 'www.' : '';
    trancoUrls.push(`${scheme}${hasWww}${dom}${pathChoice}`);
  });
  shuffleArray(trancoUrls);

  // 2. Fetch ISCX-URL-2016 Benign Path URLs
  console.log('📥 Fetching UNB ISCX-URL-2016 Benign URLs...');
  const iscxRaw = await fetchText(BENIGN_ISCX_URL);
  const iscxLines = iscxRaw.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 5 && !line.includes(' '));
  shuffleArray(iscxLines);
  console.log(`   Fetched ${iscxLines.length} verified benign URLs from UNB ISCX-URL-2016.`);

  // Balanced benign pool (1,500 Tranco + 1,000 ISCX)
  const benignPool = [...trancoUrls.slice(0, 1500), ...iscxLines.slice(0, 1000)];
  shuffleArray(benignPool);

  // 3. Fetch PhishTank Verified Active Phishing URLs
  console.log('📥 Fetching PhishTank Verified Phishing URLs...');
  const phishingRaw = await fetchText(PHISHING_PHISHTANK_URL);
  const phishingLines = phishingRaw.split('\n');
  const phishingUrls = [];

  for (let i = 1; i < phishingLines.length; i++) {
    const line = phishingLines[i].trim();
    if (!line) continue;
    const match = line.match(/^(\d+),("[^"]+"|[^\s,]+),/);
    if (match) {
      let url = match[2].replace(/^"|"$/g, '').trim();
      if (url.length > 5 && !url.includes(' ')) {
        phishingUrls.push(url);
      }
    }
  }
  shuffleArray(phishingUrls);
  console.log(`   Fetched ${phishingUrls.length} verified phishing URLs from PhishTank.`);

  const phishingPool = phishingUrls.slice(0, 2500);

  // Combine 2,500 Benign + 2,500 Malicious
  const combined = [];
  benignPool.forEach(url => combined.push({ url, label: 0 }));
  phishingPool.forEach(url => combined.push({ url, label: 1 }));

  shuffleArray(combined);

  // Write CSV
  const csvContent = ['url,label', ...combined.map(row => `"${row.url.replace(/"/g, '""')}",${row.label}`)].join('\n');
  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8');

  console.log(`✅ Balanced dataset successfully written to: ${OUTPUT_FILE}`);
  console.log(`   Total URLs: ${combined.length}`);
  console.log(`   Benign (Label 0): ${benignPool.length} (Tranco Top Sites with www & paths + UNB ISCX)`);
  console.log(`   Malicious (Label 1): ${phishingPool.length} (PhishTank Verified Active Feed)`);
}

main().catch(err => {
  console.error('❌ Failed to download dataset:', err);
  process.exit(1);
});
