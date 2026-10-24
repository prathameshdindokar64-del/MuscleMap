/**
 * mlClient.ts
 * Client for communicating with the Python ML service on port 5001.
 * Calls POST /predict with a 2-second timeout.
 * If ML service is offline or errors, returns null so the caller can fall back to rule-based logic.
 */

import { ML_SERVICE_URL } from '../config';
import { AnalyzeInput } from '../types';

export interface MLPrediction {
  riskLevel: 'mild' | 'moderate' | 'severe' | 'red_flag';
  confidence: number;
  probabilities?: Record<string, number>;
}

export async function callMLService(input: AnalyzeInput): Promise<MLPrediction | null> {
  const url = `${ML_SERVICE_URL.replace(/\/$/, '')}/predict`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const payload = {
      region: input.region,
      painType: input.painType,
      duration: input.duration,
      intensity: input.intensity,
      stressLevel: input.stressLevel ?? 1,
      trigger: input.trigger ?? 'unknown',
      onset: input.onset ?? 'gradual',
      radiating: Boolean(input.radiating),
      numbnessOrWeakness: Boolean(input.numbnessOrWeakness),
      nightPain: Boolean(input.nightPain),
      fever: Boolean(input.fever),
      bladderBowelChanges: Boolean(input.bladderBowelChanges),
      previousEpisodes: input.previousEpisodes ?? 'none',
      aggravatedBy: input.aggravatedBy ?? [],
      dailySittingHours: input.dailySittingHours ?? 4,
      sleepQuality: input.sleepQuality ?? 'good',
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`[ML Client] Service returned status ${res.status}`);
      return null;
    }

    const data = await res.json() as MLPrediction;
    if (data && typeof data.riskLevel === 'string' && typeof data.confidence === 'number') {
      console.log(`[ML Client] ML inference success: ${data.riskLevel} (${Math.round(data.confidence * 100)}% conf)`);
      return data;
    }
    return null;
  } catch (err: any) {
    // Timeout or network error - gracefully fall back
    console.warn(`[ML Client] ML service unreachable at ${url} (${err?.message || 'timeout'}). Using rules.`);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
