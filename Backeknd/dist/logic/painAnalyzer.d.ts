/**
 * Main analysis orchestrator.
 * Calls riskCalculator and exerciseSelector, assembles the full response.
 * EXTENSIBILITY: This is the single entry point — swap internals without changing the API contract.
 */
import Database from 'better-sqlite3';
import { AnalyzeInput, AnalyzeOutput } from '../types';
export declare function analyzePain(input: AnalyzeInput, db: Database.Database): AnalyzeOutput;
//# sourceMappingURL=painAnalyzer.d.ts.map