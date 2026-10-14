"""
SafeLink AI - Python Training Reference Pipeline
Reproduces the 13-feature Random Forest / Bagging Classifier using scikit-learn.

Requirements:
  pip install scikit-learn pandas numpy

Usage:
  python3 scripts/train_model.py
"""

import math
import re
import urllib.parse
import pandas as pd
import numpy as np

TARGET_KEYWORDS = [
    'login', 'verify', 'update', 'wallet', 'secure', 'account',
    'signin', 'banking', 'confirm', 'security', 'auth', 'recover',
    'password', 'credential'
]

def calculate_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    length = len(s)
    ent = 0.0
    for count in freq.values():
        p = count / length
        ent -= p * math.log2(p)
    return round(ent, 4)

def extract_13_features(url: str):
    url = str(url).strip()
    if not url or ' ' in url:
        return None
    normalized = url if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', url) else 'https://' + url
    try:
        parsed = urllib.parse.urlparse(normalized)
    except Exception:
        return None

    hostname = (parsed.hostname or '').lower()
    if not hostname:
        return None

    is_ip = 1 if re.match(r'^(\d{1,3}\.){3}\d{1,3}$', hostname) else 0
    has_punycode = 1 if 'xn--' in hostname else 0
    parts = hostname.split('.')
    subdomain_depth = max(0, len(parts) - 2) if not is_ip else 0

    url_length = len(url)
    hostname_length = len(hostname)
    dots_host = hostname.count('.')
    dots_url = url.count('.')
    hyphens_host = hostname.count('-')
    hyphens_url = url.count('-')
    has_at = 1 if '@' in url else 0
    is_https = 1 if parsed.scheme == 'https' else 0

    lower_full = (hostname + parsed.path + parsed.query).lower()
    keyword_count = sum(1 for kw in TARGET_KEYWORDS if kw in lower_full)
    entropy = calculate_entropy(hostname)

    return [
        url_length, hostname_length, dots_host, dots_url,
        hyphens_host, hyphens_url, is_ip, has_at,
        has_punycode, is_https, keyword_count, subdomain_depth,
        entropy
    ]

def main():
    print("🤖 SafeLink AI - Training Reference Pipeline (scikit-learn)")
    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
    except ImportError:
        print("ℹ️ Note: scikit-learn is not installed in this environment. Run 'pip install scikit-learn pandas' to execute.")
        return

    df = pd.read_csv('data/dataset.csv')
    print(f"📊 Loaded {len(df)} samples from data/dataset.csv")

    X = []
    y = []
    for _, row in df.iterrows():
        feat = extract_13_features(row['url'])
        if feat is not None:
            X.append(feat)
            y.append(int(row['label']))

    X = np.array(X)
    y = np.array(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=1337, stratify=y
    )

    clf = RandomForestClassifier(n_estimators=15, max_depth=8, min_samples_split=10, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("\n📊 Verified scikit-learn Evaluation on Holdout Test Set:")
    print(f"   Accuracy:  {accuracy_score(y_test, y_pred) * 100:.2f}%")
    print(f"   Precision: {precision_score(y_test, y_pred) * 100:.2f}%")
    print(f"   Recall:    {recall_score(y_test, y_pred) * 100:.2f}%")
    print(f"   F1-Score:  {f1_score(y_test, y_pred) * 100:.2f}%")
    print("   Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

if __name__ == '__main__':
    main()
