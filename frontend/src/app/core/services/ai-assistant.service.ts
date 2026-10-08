import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PolishedTimeResponse {
  raw_input: string;
  polished_description: string;
  ledes_code: string;
  activity_type: string;
  suggested_hours: number;
  tokens_processed: number;
  confidence_score: number;
}

export interface DocumentSummaryResponse {
  doc_type: string;
  word_count: number;
  compression_ratio: string;
  executive_overview: string;
  key_witness_admissions: string[];
  exposure_and_vulnerabilities: string[];
  actionable_recommendations: string[];
  summary_date: string;
}

export interface ExtractedClause {
  title: string;
  clause_type: string;
  risk_level: string;
  risk_color: string;
  excerpt: string;
  analysis: string;
}

export interface ClauseExtractionResponse {
  extracted_count: number;
  clauses: ExtractedClause[];
  scanned_length: number;
  timestamp: string;
}

export interface IndianStatuteResponse {
  query: string;
  matched: boolean;
  engine?: string;
  aiThinkingSteps?: string[];
  title: string;
  bnsSection?: string;
  ipcSection?: string;
  procedureCode?: string;
  offenceType?: string;
  triableBy?: string;
  punishment?: string;
  legalElements?: string[];
  aggravatedCircumstances?: string[];
  proceduralGuidance?: string;
  landmarkJudgments?: string[];
  concordanceNotice?: string;
  summary?: string;
  primaryRecommendation?: string;
  suggestedSearches?: string[];
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  constructor(private api: ApiService) {}

  polishTimeSlip(payload: {
    rawNote: string;
    matter?: string;
    client?: string;
    hours?: number;
  }): Observable<{ success: boolean; message: string; data: PolishedTimeResponse }> {
    return this.api.post('documents/ai/polish-time', payload);
  }

  summarizeDocument(payload: {
    text: string;
    docType?: string;
  }): Observable<{ success: boolean; message: string; data: DocumentSummaryResponse }> {
    return this.api.post('documents/ai/summarize', payload);
  }

  extractClauses(payload: {
    contractText: string;
  }): Observable<{ success: boolean; message: string; data: ClauseExtractionResponse }> {
    return this.api.post('documents/ai/extract-clauses', payload);
  }

  searchStatute(payload: {
    query: string;
    apiKey?: string;
    options?: any;
  }): Observable<{ success: boolean; message: string; data: IndianStatuteResponse }> {
    return this.api.post('documents/ai/statute-lookup', payload);
  }

  summarizeDocumentOffline(payload: {
    text: string;
    title?: string;
  }): Observable<{ success: boolean; data: any; message?: string }> {
    return this.api.post('documents/summarize-offline', payload);
  }
}
