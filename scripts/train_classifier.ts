/**
 * SafeLink AI - Real Machine Learning Model Training & Evaluation
 *
 * Trains a Decision Tree Bagging Ensemble on data/dataset.csv using the
 * EXACT shared 13-feature extractor from src/ml/featureExtractor.ts.
 *
 * Performs an 80/20 stratified train/test split, calculates genuine test metrics
 * (Accuracy, Precision, Recall, F1, Confusion Matrix), and exports:
 * - src/ml/trainedModel.json (the serialized tree ensemble)
 * - src/ml/modelEvaluation.json (exact evaluated metrics for transparency)
 */

import fs from 'fs';
import path from 'path';
import { DecisionTreeClassifier } from 'ml-cart';
import { extract13Features, FEATURE_METADATA } from '../src/ml/featureExtractor';

const DATASET_FILE = path.resolve('data/dataset.csv');
const MODEL_OUT = path.resolve('src/ml/trainedModel.json');
const EVAL_OUT = path.resolve('src/ml/modelEvaluation.json');

interface DatasetRow {
  url: string;
  label: number;
}

function parseCSV(content: string): DatasetRow[] {
  const lines = content.split('\n');
  const rows: DatasetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lastComma = line.lastIndexOf(',');
    if (lastComma === -1) continue;

    let urlPart = line.substring(0, lastComma).trim();
    const labelPart = line.substring(lastComma + 1).trim();

    if (urlPart.startsWith('"') && urlPart.endsWith('"')) {
      urlPart = urlPart.slice(1, -1).replace(/""/g, '"');
    }

    const label = parseInt(labelPart, 10);
    if (!isNaN(label) && (label === 0 || label === 1)) {
      rows.push({ url: urlPart, label });
    }
  }

  return rows;
}

// Traverse tree to calculate feature split importance
function collectFeatureImportance(node: any, importances: number[]) {
  if (!node || node.distribution) return;
  if (typeof node.splitColumn === 'number' && node.splitColumn >= 0 && node.splitColumn < importances.length) {
    importances[node.splitColumn] += (node.gain || 1);
  }
  if (node.left) collectFeatureImportance(node.left, importances);
  if (node.right) collectFeatureImportance(node.right, importances);
}

async function main() {
  console.log('🤖 Starting SafeLink AI Model Training Pipeline...');

  if (!fs.existsSync(DATASET_FILE)) {
    throw new Error(`Dataset file not found at ${DATASET_FILE}. Run download_dataset first.`);
  }

  const rawCsv = fs.readFileSync(DATASET_FILE, 'utf-8');
  const rawRows = parseCSV(rawCsv);
  console.log(`📊 Loaded ${rawRows.length} rows from dataset.csv.`);

  // Feature extraction using shared 13-feature extractor
  console.log('⚙️  Extracting 13 shared features for all dataset URLs...');
  const X_all: number[][] = [];
  const y_all: number[] = [];
  let skipped = 0;

  for (const row of rawRows) {
    const feat = extract13Features(row.url);
    if (feat && feat.vector.length === 13) {
      X_all.push(feat.vector);
      y_all.push(row.label);
    } else {
      skipped++;
    }
  }

  console.log(`   Successfully extracted features for ${X_all.length} URLs (${skipped} skipped due to malformed URI).`);

  // 80% Train, 20% Holdout Test Split (Stratified)
  const indices0 = y_all.map((y, idx) => (y === 0 ? idx : -1)).filter(idx => idx !== -1);
  const indices1 = y_all.map((y, idx) => (y === 1 ? idx : -1)).filter(idx => idx !== -1);

  // Deterministic shuffle
  let seed = 1337;
  function prng() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  function shuffleArray(arr: number[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  shuffleArray(indices0);
  shuffleArray(indices1);

  const trainCount0 = Math.floor(indices0.length * 0.8);
  const trainCount1 = Math.floor(indices1.length * 0.8);

  const trainIndices = [...indices0.slice(0, trainCount0), ...indices1.slice(0, trainCount1)];
  const testIndices = [...indices0.slice(trainCount0), ...indices1.slice(trainCount1)];

  shuffleArray(trainIndices);
  shuffleArray(testIndices);

  const X_train = trainIndices.map(i => X_all[i]);
  const y_train = trainIndices.map(i => y_all[i]);
  const X_test = testIndices.map(i => X_all[i]);
  const y_test = testIndices.map(i => y_all[i]);

  console.log(`📈 Train Set: ${X_train.length} samples (${y_train.filter(y => y === 0).length} benign, ${y_train.filter(y => y === 1).length} malicious)`);
  console.log(`🧪 Test Set:  ${X_test.length} samples (${y_test.filter(y => y === 0).length} benign, ${y_test.filter(y => y === 1).length} malicious)`);

  // Train Ensemble of 7 Decision Trees with Bootstrap Aggregation
  const nTrees = 7;
  console.log(`🌲 Training Decision Tree Ensemble (${nTrees} regularized estimators, maxDepth=8)...`);
  const startTime = Date.now();
  const trees: any[] = [];
  const serializedTrees: any[] = [];

  for (let t = 0; t < nTrees; t++) {
    const bootX: number[][] = [];
    const bootY: number[] = [];
    const sampleSize = Math.floor(X_train.length * 0.75);

    for (let s = 0; s < sampleSize; s++) {
      const idx = Math.floor(prng() * X_train.length);
      bootX.push(X_train[idx]);
      bootY.push(y_train[idx]);
    }

    const dt = new DecisionTreeClassifier({
      maxDepth: 8,
      minNumSamples: 10,
    });
    dt.train(bootX, bootY);
    trees.push(dt);
    serializedTrees.push(dt.toJSON());
  }

  const trainDurationMs = Date.now() - startTime;
  console.log(`✅ Training completed in ${trainDurationMs}ms.`);

  // Evaluate on 20% Holdout Test Set
  console.log('🔬 Evaluating model on holdout test set...');
  let tp = 0; // True Positive: Actual Malicious (1), Predicted Malicious (1)
  let fp = 0; // False Positive: Actual Benign (0), Predicted Malicious (1)
  let tn = 0; // True Negative: Actual Benign (0), Predicted Benign (0)
  let fn = 0; // False Negative: Actual Malicious (1), Predicted Benign (0)

  for (let i = 0; i < y_test.length; i++) {
    const actual = y_test[i];
    const sample = X_test[i];

    const votes = trees.map(t => t.predict([sample])[0]);
    const maliciousVotes = votes.filter(v => v === 1).length;
    const pred = maliciousVotes / nTrees >= 0.5 ? 1 : 0;

    if (actual === 1 && pred === 1) tp++;
    else if (actual === 0 && pred === 1) fp++;
    else if (actual === 0 && pred === 0) tn++;
    else if (actual === 1 && pred === 0) fn++;
  }

  const accuracy = (tp + tn) / y_test.length;
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1 = (2 * precision * recall) / (precision + recall || 1);

  console.log('\n📊 REAL EVALUATION RESULTS (Test Set):');
  console.log(`   Accuracy:  ${(accuracy * 100).toFixed(2)}%`);
  console.log(`   Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`   Recall:    ${(recall * 100).toFixed(2)}%`);
  console.log(`   F1-Score:  ${(f1 * 100).toFixed(2)}%`);
  console.log('   Confusion Matrix:');
  console.log(`     TP: ${tp} | FP: ${fp}`);
  console.log(`     FN: ${fn} | TN: ${tn}`);

  // Calculate feature importances
  const importanceRaw = new Array(13).fill(0);
  serializedTrees.forEach(t => collectFeatureImportance(t.root, importanceRaw));
  const totalImportance = importanceRaw.reduce((a, b) => a + b, 0) || 1;
  const featureImportances = FEATURE_METADATA.map((f, idx) => ({
    id: f.id,
    name: f.name,
    weight: Math.round((importanceRaw[idx] / totalImportance) * 1000) / 10,
  })).sort((a, b) => b.weight - a.weight);

  // Save model payload
  const modelPayload = {
    modelType: 'DecisionTreeBaggingEnsemble',
    nEstimators: nTrees,
    featureCount: 13,
    trees: serializedTrees,
  };
  fs.writeFileSync(MODEL_OUT, JSON.stringify(modelPayload), 'utf-8');
  console.log(`\n💾 Saved trained model weights to: ${MODEL_OUT} (${(fs.statSync(MODEL_OUT).size / 1024).toFixed(1)} KB)`);

  // Save verified evaluation report
  const evaluationReport = {
    trainedAt: new Date().toISOString(),
    modelArchitecture: `Decision Tree Bagging Ensemble (${nTrees} Estimators, maxDepth=8)`,
    datasetSources: [
      'UNB ISCX-URL-2016 (Canadian Institute for Cybersecurity) - Benign URLs',
      'PhishTank Verified Active Phishing Corpus - Malicious/Phishing URLs',
    ],
    totalDatasetSamples: X_all.length,
    trainSamples: X_train.length,
    testSamples: X_test.length,
    featuresUsedCount: 13,
    featureImportances,
    metrics: {
      accuracy: Math.round(accuracy * 10000) / 100,
      precision: Math.round(precision * 10000) / 100,
      recall: Math.round(recall * 10000) / 100,
      f1Score: Math.round(f1 * 10000) / 100,
      confusionMatrix: {
        truePositives: tp,
        falsePositives: fp,
        trueNegatives: tn,
        falseNegatives: fn,
      },
    },
    trainDurationMs,
  };

  fs.writeFileSync(EVAL_OUT, JSON.stringify(evaluationReport, null, 2), 'utf-8');
  console.log(`📄 Saved verified evaluation report to: ${EVAL_OUT}`);
}

main().catch(err => {
  console.error('❌ Training error:', err);
  process.exit(1);
});
