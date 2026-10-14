/**
 * SafeLink AI - Real Machine Learning Inference Engine
 *
 * Runs client-side inference using the trained Decision Tree Bagging Ensemble.
 * Evaluates the exact 13-feature vector against all trained tree estimators,
 * aggregates real ensemble votes, and provides verified model evaluation metadata.
 */

import { DecisionTreeClassifier } from 'ml-cart';
import trainedModelData from './trainedModel.json';
import evaluationData from './modelEvaluation.json';
import { extract13Features, ExtractedFeatureVector } from './featureExtractor';

export interface MLPrediction {
  isMalicious: boolean;
  verdict: 'Malicious / Phishing' | 'Benign / Low Lexical Risk';
  confidencePercent: number; // Ratio of trees voting malicious (0% to 100%)
  maliciousVotes: number;
  totalEstimators: number;
  extractedFeatures: ExtractedFeatureVector;
  modelMetadata: {
    modelArchitecture: string;
    datasetSources: string[];
    testAccuracy: number;
    testPrecision: number;
    testRecall: number;
    testF1: number;
    confusionMatrix: {
      tp: number;
      fp: number;
      tn: number;
      fn: number;
    };
    trainedAt: string;
    featureImportances: Array<{ id: string; name: string; weight: number }>;
  };
}

let cachedTrees: any[] | null = null;

function getEnsembleTrees(): any[] {
  if (!cachedTrees) {
    cachedTrees = (trainedModelData.trees || []).map((t: any) => DecisionTreeClassifier.load(t));
  }
  return cachedTrees;
}

/**
 * Predicts whether a URL is malicious using the trained ensemble.
 */
export function predictUrl(rawUrl: string): { prediction?: MLPrediction; error?: string } {
  const feat = extract13Features(rawUrl);
  if (!feat) {
    return { error: 'Failed to extract URL features for ML inference.' };
  }

  const trees = getEnsembleTrees();
  const votes: number[] = trees.map(tree => {
    try {
      const pred = tree.predict([feat.vector]);
      return pred[0] === 1 ? 1 : 0;
    } catch {
      return 0;
    }
  });

  const maliciousVotes = votes.filter(v => v === 1).length;
  const ratio = maliciousVotes / (trees.length || 1);
  const isMalicious = ratio >= 0.5;

  const prediction: MLPrediction = {
    isMalicious,
    verdict: isMalicious ? 'Malicious / Phishing' : 'Benign / Low Lexical Risk',
    confidencePercent: Math.round(ratio * 1000) / 10,
    maliciousVotes,
    totalEstimators: trees.length,
    extractedFeatures: feat,
    modelMetadata: {
      modelArchitecture: evaluationData.modelArchitecture,
      datasetSources: evaluationData.datasetSources,
      testAccuracy: evaluationData.metrics.accuracy,
      testPrecision: evaluationData.metrics.precision,
      testRecall: evaluationData.metrics.recall,
      testF1: evaluationData.metrics.f1Score,
      confusionMatrix: {
        tp: evaluationData.metrics.confusionMatrix.truePositives,
        fp: evaluationData.metrics.confusionMatrix.falsePositives,
        tn: evaluationData.metrics.confusionMatrix.trueNegatives,
        fn: evaluationData.metrics.confusionMatrix.falseNegatives,
      },
      trainedAt: evaluationData.trainedAt,
      featureImportances: evaluationData.featureImportances || [],
    },
  };

  return { prediction };
}

export function getEvaluationReport() {
  return evaluationData;
}
