import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssistantService, ClauseExtractionResponse, DocumentSummaryResponse, PolishedTimeResponse, IndianStatuteResponse } from '../../core/services/ai-assistant.service';
import { TimeTrackingService } from '../../core/services/time-tracking.service';
import { CaseService } from '../../core/services/case.service';
import { NotificationService } from '../../core/services/notification.service';
import { Case } from '../../core/models/models';
import { AppCardComponent } from '../../shared/components/card/card.component';
import { AppBadgeComponent } from '../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppCardComponent,
    AppBadgeComponent,
    AppButtonComponent
  ],
  template: `
    <div class="ai-assistant-page">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">AI Legal Assistant (Co-Counsel)</h2>
          <p class="text-muted small mb-0">
            Autonomous legal reasoning engine for Indian Law: Real-time statutory thinking, BNS ↔ IPC concordance, time slip polishing, and contract analysis
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary bg-white shadow-sm" (click)="showSettingsModal = !showSettingsModal">
            <i class="bi bi-sliders me-1"></i> AI Engine Configuration
          </button>
          <span class="badge bg-primary-subtle text-primary border px-3 py-2 d-flex align-items-center">
            <i class="bi bi-cpu-fill me-1"></i> {{ activeEngineBadge }}
          </span>
        </div>
      </div>

      <!-- AI Configuration Panel (Collapsible) -->
      <div *ngIf="showSettingsModal" class="p-3 bg-white border rounded-3 shadow-sm mb-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
              <i class="bi bi-tag-fill me-1"></i> 100% ZERO COST & FREE TIERS
            </span>
            <h6 class="fw-bold text-dark mb-0">
              <i class="bi bi-robot text-primary me-1"></i> AI Thinking Models & Zero-Cost Setup
            </h6>
          </div>
          <button type="button" class="btn-close btn-sm" (click)="showSettingsModal = false"></button>
        </div>
        <p class="small text-muted mb-3">
          You do <strong>not</strong> need to pay for AI tokens. JusticeFlow operates at <strong>zero cost ($0.00)</strong> using either the built-in legal engine, Google AI Studio's free tier, Groq free cloud, or local offline Ollama:
        </p>

        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-5">
            <label class="form-label small fw-semibold">Select AI Model</label>
            <select class="form-select form-select-sm" [(ngModel)]="aiProvider" (change)="onProviderChange()">
              <option value="auto">⚡ Built-in Autonomous Legal Engine [100% FREE - No Key, $0.00]</option>
              <option value="gemini">✨ Google Gemini 1.5 Flash [100% FREE Tier - 1,500 req/day]</option>
              <option value="groq">🚀 Groq Llama-3.3-70B [100% FREE - Ultra-Fast, No Card]</option>
              <option value="openrouter">🌐 OpenRouter DeepSeek & Llama :free [100% FREE]</option>
              <option value="ollama">💻 Local Ollama [100% FREE Offline - Runs on your PC]</option>
              <option value="openai">🤖 OpenAI GPT-4o / GPT-4o-mini (Paid Account Key)</option>
            </select>
          </div>

          <div class="col-12 col-md-5" *ngIf="aiProvider !== 'auto' && aiProvider !== 'ollama'">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label small fw-semibold mb-0">
                {{ getApiKeyLabel() }}
              </label>
              <a *ngIf="getFreeKeyLink()" [href]="getFreeKeyLink()" target="_blank" class="small text-primary text-decoration-none">
                <i class="bi bi-box-arrow-up-right me-1"></i> Get Free Key (30s)
              </a>
            </div>
            <input
              type="password"
              class="form-control form-control-sm"
              [placeholder]="getApiKeyPlaceholder()"
              [(ngModel)]="aiApiKey" />
          </div>

          <div class="col-12 col-md-5" *ngIf="aiProvider === 'ollama'">
            <label class="form-label small fw-semibold mb-1">Local Ollama Endpoint (Default: http://localhost:11434)</label>
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="http://localhost:11434"
              [(ngModel)]="ollamaUrl" />
          </div>

          <div class="col-12 col-md-2">
            <button class="btn btn-sm btn-primary w-100" (click)="saveAiSettings()">
              <i class="bi bi-check-lg me-1"></i> Apply Model
            </button>
          </div>
        </div>

        <!-- Zero Cost Model Cards & Helper Badges -->
        <div class="row g-2 mt-3 pt-2 border-top">
          <div class="col-12 col-md-3">
            <div class="p-2 border rounded-2 bg-light small">
              <div class="fw-bold text-success"><i class="bi bi-lightning-charge me-1"></i> Built-in Engine</div>
              <span class="text-muted" style="font-size: 11px;">$0.00 cost forever. No signup or keys required.</span>
            </div>
          </div>
          <div class="col-12 col-md-3">
            <div class="p-2 border rounded-2 bg-light small">
              <div class="fw-bold text-primary"><i class="bi bi-google me-1"></i> Gemini 1.5 Flash</div>
              <span class="text-muted" style="font-size: 11px;">100% Free on <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>. No credit card.</span>
            </div>
          </div>
          <div class="col-12 col-md-3">
            <div class="p-2 border rounded-2 bg-light small">
              <div class="fw-bold text-dark"><i class="bi bi-speedometer2 me-1"></i> Groq Llama-3.3</div>
              <span class="text-muted" style="font-size: 11px;">Free 500 tok/sec on <a href="https://console.groq.com/keys" target="_blank">Groq Console</a>. Zero fee.</span>
            </div>
          </div>
          <div class="col-12 col-md-3">
            <div class="p-2 border rounded-2 bg-light small">
              <div class="fw-bold text-secondary"><i class="bi bi-pc-display me-1"></i> Local Ollama</div>
              <span class="text-muted" style="font-size: 11px;">100% Offline & Free. Run <code>ollama run llama3.2</code> locally.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-3 border">
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'statute-finder'"
            (click)="activeTab = 'statute-finder'">
            <i class="bi bi-book-half me-1"></i> Indian Law & Penal Code Finder (BNS / IPC / BNSS)
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'time-polisher'"
            (click)="activeTab = 'time-polisher'">
            <i class="bi bi-clock-history me-1"></i> Time Slip Polisher
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'summarizer'"
            (click)="activeTab = 'summarizer'">
            <i class="bi bi-file-earmark-text me-1"></i> Document Summarizer (1-Page Brief)
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'clause-extractor'"
            (click)="activeTab = 'clause-extractor'">
            <i class="bi bi-search me-1"></i> Contract Clause Extractor
          </button>
        </li>
      </ul>

      <!-- TAB 0: Indian Law & Penal Code Finder (BNS / IPC / BNSS) -->
      <div *ngIf="activeTab === 'statute-finder'" class="statute-finder-section">
        <!-- Search Bar Hero Card -->
        <app-card class="mb-4">
          <div class="row align-items-center g-3">
            <div class="col-12 col-md-8">
              <label class="form-label fw-bold text-dark mb-1">
                <i class="bi bi-search text-primary me-1"></i> Ask AI Co-Counsel: What is the Section / Law in India?
              </label>
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0 text-muted">
                  <i class="bi bi-shield-shaded"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 py-2"
                  placeholder="e.g. what is the section for pickpocket, cheque bounce, anticipatory bail..."
                  [(ngModel)]="statuteQuery"
                  (keyup.enter)="searchStatute()" />
                <button
                  class="btn btn-primary px-4 fw-semibold"
                  (click)="searchStatute()"
                  [disabled]="isSearchingStatute || !statuteQuery">
                  <i class="bi bi-magic me-1"></i>
                  {{ isSearchingStatute ? 'Consulting Indian Codes...' : 'Find Section & Law' }}
                </button>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="p-2 bg-light rounded-3 border small">
                <div class="fw-bold text-dark mb-1"><i class="bi bi-info-circle-fill text-info me-1"></i> BNS 2023 Concordance Active</div>
                <div class="text-muted" style="font-size: 11px;">
                  Dual mapping enabled: Automatically displays current <strong>Bharatiya Nyaya Sanhita (BNS)</strong> alongside historic <strong>IPC 1860</strong>.
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Suggestion Buttons -->
          <div class="mt-3 pt-3 border-top">
            <span class="small fw-semibold text-muted me-2">Frequent Indian Legal Inquiries:</span>
            <div class="d-inline-flex flex-wrap gap-2 mt-1">
              <button
                type="button"
                class="btn btn-xs btn-outline-primary"
                (click)="setStatuteQuery('what is the section for pickpocket')">
                <i class="bi bi-wallet2 me-1"></i> Pickpocketing & Snatching
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary"
                (click)="setStatuteQuery('cheque bounce section 138')">
                <i class="bi bi-credit-card-2-front me-1"></i> Cheque Bounce (Sec 138 NI Act)
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary"
                (click)="setStatuteQuery('anticipatory bail section')">
                <i class="bi bi-shield-lock me-1"></i> Anticipatory Bail (Sec 482 BNSS / 438 CrPC)
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary"
                (click)="setStatuteQuery('cheating and fraud 420')">
                <i class="bi bi-exclamation-octagon me-1"></i> Cheating & Fraud (Sec 318 BNS / 420 IPC)
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary"
                (click)="setStatuteQuery('cyber fraud otp scam')">
                <i class="bi bi-laptop me-1"></i> Cyber Fraud (IT Act 66D)
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary"
                (click)="setStatuteQuery('theft in house chori')">
                <i class="bi bi-house-door me-1"></i> Theft in House (Sec 305 BNS)
              </button>
            </div>
          </div>
        </app-card>

        <!-- Search Result Details Card -->
        <div *ngIf="statuteResult" class="statute-result-wrapper">
          <!-- Header Banner -->
          <div class="card border-0 shadow-sm rounded-3 mb-4 bg-white overflow-hidden">
            <div class="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <span class="badge bg-warning text-dark fw-bold me-2 px-2 py-1">
                  <i class="bi bi-scale me-1"></i> INDIAN PENAL JURISPRUDENCE
                </span>
                <span class="text-white-50 small">Query: "{{ statuteResult.query }}"</span>
                <h4 class="mb-0 mt-1 fw-bold text-white">{{ statuteResult.title }}</h4>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-light" (click)="copyStatuteAnalysis()">
                  <i class="bi bi-clipboard me-1"></i> Copy Citations
                </button>
                <button class="btn btn-sm btn-light" (click)="printStatuteAnalysis()">
                  <i class="bi bi-printer me-1"></i> Print Legal Memo
                </button>
              </div>
            </div>

            <div class="card-body p-4">
              <!-- Concordance Notice Alert -->
              <div *ngIf="statuteResult.concordanceNotice" class="alert alert-primary d-flex align-items-center mb-4 py-2 px-3 rounded-2" role="alert">
                <i class="bi bi-info-circle-fill fs-5 me-2 flex-shrink-0"></i>
                <div class="small mb-0">
                  <strong>Statutory Transition Notice:</strong> {{ statuteResult.concordanceNotice }}
                </div>
              </div>

              <!-- AI Real-Time Thinking Process Panel -->
              <div *ngIf="statuteResult.aiThinkingSteps?.length" class="p-3 bg-light rounded-3 border mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small fw-bold text-uppercase text-primary d-flex align-items-center">
                    <i class="bi bi-cpu text-primary me-2"></i> Autonomous AI Legal Reasoning Chain (Automatic Thinking)
                  </span>
                  <span class="badge bg-primary-subtle text-primary border px-2 py-1" style="font-size: 11px;">
                    <i class="bi bi-lightning-charge-fill me-1"></i> {{ statuteResult.engine || 'Autonomous Legal Reasoning Engine' }}
                  </span>
                </div>
                <div class="d-flex flex-column gap-1 pt-1">
                  <div *ngFor="let step of statuteResult.aiThinkingSteps" class="small text-muted d-flex align-items-start">
                    <i class="bi bi-check-circle-fill text-success me-2 mt-1" style="font-size: 11px;"></i>
                    <span class="text-dark">{{ step }}</span>
                  </div>
                </div>
              </div>

              <!-- Primary Section Cards: BNS vs IPC side-by-side -->
              <div class="row g-3 mb-4">
                <!-- Current Law: BNS 2023 -->
                <div class="col-12 col-md-6">
                  <div class="p-3 rounded-3 border border-success bg-success-subtle h-100">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge bg-success fw-bold">
                        <i class="bi bi-check-circle-fill me-1"></i> ACTIVE LAW (Acts on/after 1 July 2024)
                      </span>
                      <small class="fw-bold text-success text-uppercase">Bharatiya Nyaya Sanhita</small>
                    </div>
                    <h5 class="fw-bold text-success-emphasis mb-2">
                      {{ statuteResult.bnsSection }}
                    </h5>
                    <div class="small text-dark">
                      <strong>Statutory Punishment:</strong> {{ statuteResult.punishment }}
                    </div>
                  </div>
                </div>

                <!-- Historic Law: IPC 1860 -->
                <div class="col-12 col-md-6">
                  <div class="p-3 rounded-3 border border-secondary bg-light h-100">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge bg-secondary fw-bold">
                        <i class="bi bi-archive me-1"></i> LEGACY / ONGOING (Acts prior to 1 July 2024)
                      </span>
                      <small class="fw-bold text-secondary text-uppercase">Indian Penal Code, 1860</small>
                    </div>
                    <h5 class="fw-bold text-dark mb-2">
                      {{ statuteResult.ipcSection }}
                    </h5>
                    <div class="small text-muted">
                      <strong>Procedure:</strong> {{ statuteResult.procedureCode }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Offence Classification Badges -->
              <div class="p-3 bg-light rounded-3 border mb-4">
                <h6 class="fw-bold small text-muted text-uppercase mb-2">Criminal Classification & Jurisdiction</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 fs-6">
                    <i class="bi bi-shield-exclamation me-1"></i> {{ getOffenceTypePart(0) }}
                  </span>
                  <span class="badge bg-warning-subtle text-dark border border-warning-subtle px-3 py-2 fs-6">
                    <i class="bi bi-lock me-1"></i> {{ getOffenceTypePart(1) }}
                  </span>
                  <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2 fs-6">
                    <i class="bi bi-building me-1"></i> Triable by: {{ statuteResult.triableBy }}
                  </span>
                  <span *ngIf="isCompoundable()" class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fs-6">
                    <i class="bi bi-handshake me-1"></i> Compoundable with Court Permission
                  </span>
                </div>
              </div>

              <!-- Legal Elements & Ingredients to Prove in Court -->
              <div *ngIf="statuteResult.legalElements?.length" class="mb-4">
                <h6 class="fw-bold text-primary text-uppercase small mb-2">
                  <i class="bi bi-list-check me-1"></i> Essential Legal Elements & Ingredients (Prosecution Burden of Proof)
                </h6>
                <ul class="list-group list-group-flush border rounded-3">
                  <li *ngFor="let elem of statuteResult.legalElements; let i = index" class="list-group-item small py-2 d-flex align-items-start">
                    <span class="badge bg-primary rounded-pill me-2 mt-1">{{ i + 1 }}</span>
                    <span class="text-dark">{{ elem }}</span>
                  </li>
                </ul>
              </div>

              <!-- Aggravated / Escalated Charges -->
              <div *ngIf="statuteResult.aggravatedCircumstances?.length" class="mb-4">
                <h6 class="fw-bold text-danger text-uppercase small mb-2">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> Escalated / Aggravated Offences (Robbery, Syndicate, Transit)
                </h6>
                <div class="alert alert-danger bg-danger-subtle border-danger-subtle p-3 rounded-3 mb-0">
                  <ul class="mb-0 ps-3 small text-danger-emphasis">
                    <li *ngFor="let agg of statuteResult.aggravatedCircumstances" class="mb-1">
                      {{ agg }}
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Advocate Strategy & Procedural Guidance -->
              <div *ngIf="statuteResult.proceduralGuidance" class="mb-4 p-3 bg-white rounded-3 border-start border-4 border-warning shadow-sm">
                <h6 class="fw-bold text-dark text-uppercase small mb-1">
                  <i class="bi bi-briefcase-fill text-warning me-1"></i> Advocate Litigation Strategy & FIR Drafting Pointers
                </h6>
                <p class="small text-muted mb-0">
                  {{ statuteResult.proceduralGuidance }}
                </p>
              </div>

              <!-- Landmark Precedents & Judgments -->
              <div *ngIf="statuteResult.landmarkJudgments?.length">
                <h6 class="fw-bold text-secondary text-uppercase small mb-2">
                  <i class="bi bi-journal-bookmark-fill me-1"></i> Landmark Supreme Court & High Court Precedents
                </h6>
                <div class="list-group border rounded-3">
                  <div *ngFor="let j of statuteResult.landmarkJudgments" class="list-group-item small py-2 bg-light">
                    <i class="bi bi-award text-warning me-2"></i>
                    <strong>{{ getJudgmentCitation(j) }}</strong><span *ngIf="getJudgmentSummary(j)">: {{ getJudgmentSummary(j) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 1: Time Slip Polisher -->
      <div *ngIf="activeTab === 'time-polisher'" class="row g-4">
        <div class="col-12 col-lg-6">
          <app-card title="Raw Attorney Shorthand Note Input">
            <p class="text-muted small">
              Convert rough attorney shorthand into detailed, client-ready LEDES billing descriptions with assigned UTBMS task codes.
            </p>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Quick Sample Prompts</label>
              <div class="d-flex flex-wrap gap-1">
                <button type="button" class="btn btn-xs btn-outline-secondary" (click)="setQuickPrompt('call apex boss about boat')">
                  "call apex boss about boat"
                </button>
                <button type="button" class="btn btn-xs btn-outline-secondary" (click)="setQuickPrompt('review email from client about money')">
                  "review email from client about money"
                </button>
                <button type="button" class="btn btn-xs btn-outline-secondary" (click)="setQuickPrompt('court hearing quickfreight judge')">
                  "court hearing quickfreight judge"
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Attorney Shorthand Notes *</label>
              <textarea
                class="form-control form-control-sm"
                rows="4"
                [(ngModel)]="rawTimeNote"
                placeholder="e.g. call apex boss about boat and discussed delayed cargo telemetry">
              </textarea>
            </div>

            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label fw-semibold small">Matter Reference</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="matterContext" placeholder="e.g. Apex Maritime Breach of Contract">
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold small">Client Name</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="clientContext" placeholder="e.g. Apex Logistics International">
              </div>
            </div>

            <button
              class="btn btn-primary btn-sm w-100 py-2"
              (click)="polishTimeNote()"
              [disabled]="isPolishing || !rawTimeNote">
              <i class="bi bi-magic me-1"></i>
              {{ isPolishing ? 'Polishing via Legal Lexicon...' : 'Polish into Client-Ready Description' }}
            </button>
          </app-card>
        </div>

        <div class="col-12 col-lg-6">
          <app-card title="Polished LEDES-Compliant Billing Entry">
            <div *ngIf="!polishedTimeResult" class="text-center py-5 text-muted">
              <i class="bi bi-stars display-4 text-primary opacity-50 mb-3 d-block"></i>
              <h6 class="fw-bold">Awaiting Shorthand Input</h6>
              <p class="small mb-0">Enter attorney shorthand notes on the left to generate client-ready, auditor-proof billing descriptions.</p>
            </div>

            <div *ngIf="polishedTimeResult" class="polished-result-box">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-success">
                  <i class="bi bi-shield-check me-1"></i> UTBMS Task Code: {{ polishedTimeResult.ledes_code }}
                </span>
                <span class="badge bg-light text-dark border">
                  {{ polishedTimeResult.activity_type }}
                </span>
              </div>

              <div class="p-3 bg-light rounded-3 border mb-3">
                <label class="fw-bold small text-muted text-uppercase mb-1 d-block">Client-Ready Description</label>
                <div class="fw-medium text-dark" style="font-size: 0.95rem; line-height: 1.5;">
                  {{ polishedTimeResult.polished_description }}
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="p-2 border rounded text-center">
                    <div class="text-muted" style="font-size: 11px;">SUGGESTED TIME</div>
                    <div class="fw-bold">{{ polishedTimeResult.suggested_hours }} hrs</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2 border rounded text-center">
                    <div class="text-muted" style="font-size: 11px;">AUDIT READINESS</div>
                    <div class="fw-bold text-success">{{ polishedTimeResult.confidence_score }}%</div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                <button class="btn btn-sm btn-outline-secondary" (click)="copyPolishedText(polishedTimeResult.polished_description)">
                  <i class="bi bi-clipboard me-1"></i> Copy Text
                </button>
                <button class="btn btn-sm btn-success" (click)="saveToTimeTracking()">
                  <i class="bi bi-plus-circle me-1"></i> Save Directly to Time Slips
                </button>
              </div>
            </div>
          </app-card>
        </div>
      </div>

      <!-- TAB 2: Document Summarizer (1-Page Executive Brief) -->
      <div *ngIf="activeTab === 'summarizer'" class="row g-4">
        <div class="col-12 col-lg-5">
          <app-card title="Deposition Transcript / Brief Input">
            <p class="text-muted small">
              Paste deposition testimony, hearing transcripts, or voluminous motions to generate an actionable 1-page executive brief.
            </p>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Document Type</label>
              <select class="form-select form-select-sm" [(ngModel)]="docType">
                <option value="Deposition Transcript">Deposition Examination Transcript</option>
                <option value="Court Motion & Memorandum">Court Motion & Legal Memorandum</option>
                <option value="Expert Witness Report">Expert Witness Technical Report</option>
                <option value="Settlement Agreement">Settlement & Release Agreement</option>
              </select>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-semibold small mb-0">Transcript Text *</label>
                <button type="button" class="btn btn-xs btn-outline-primary" (click)="loadSampleDeposition()">
                  Load Sample Deposition
                </button>
              </div>
              <textarea
                class="form-control form-control-sm font-monospace"
                rows="10"
                [(ngModel)]="docText"
                placeholder="Paste transcript or brief text...">
              </textarea>
            </div>

            <button
              class="btn btn-primary btn-sm w-100 py-2"
              (click)="summarizeDoc()"
              [disabled]="isSummarizing || !docText">
              <i class="bi bi-file-earmark-ruled me-1"></i>
              {{ isSummarizing ? 'Synthesizing Executive Brief...' : 'Generate 1-Page Executive Brief' }}
            </button>
          </app-card>
        </div>

        <div class="col-12 col-lg-7">
          <app-card title="1-Page Executive Brief for Trial Counsel">
            <div *ngIf="!summaryResult" class="text-center py-5 text-muted">
              <i class="bi bi-file-earmark-text display-4 text-primary opacity-50 mb-3 d-block"></i>
              <h6 class="fw-bold">No Summary Generated</h6>
              <p class="small mb-0">Paste transcript text and click "Generate 1-Page Executive Brief" to summarize witness testimony and legal liabilities.</p>
            </div>

            <div *ngIf="summaryResult" class="brief-container">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div>
                  <h6 class="fw-bold mb-0 text-dark">{{ summaryResult.doc_type }} - Executive Brief</h6>
                  <span class="small text-muted">{{ summaryResult.word_count }} words &bull; {{ summaryResult.compression_ratio }}</span>
                </div>
                <button class="btn btn-sm btn-outline-secondary" (click)="printBrief()">
                  <i class="bi bi-printer me-1"></i> Print Brief
                </button>
              </div>

              <!-- Overview -->
              <div class="mb-3">
                <div class="fw-bold small text-uppercase text-secondary mb-1">Procedural Overview</div>
                <div class="p-2 bg-light rounded text-dark small">{{ summaryResult.executive_overview }}</div>
              </div>

              <!-- Key Witness Admissions -->
              <div class="mb-3">
                <div class="fw-bold small text-uppercase text-primary mb-1">Key Witness Admissions on Record</div>
                <ul class="list-group list-group-flush border rounded">
                  <li *ngFor="let adm of summaryResult.key_witness_admissions" class="list-group-item small py-2">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>{{ adm }}
                  </li>
                </ul>
              </div>

              <!-- Liabilities & Vulnerabilities -->
              <div class="mb-3">
                <div class="fw-bold small text-uppercase text-danger mb-1">Legal Exposure & Vulnerabilities</div>
                <ul class="list-group list-group-flush border rounded">
                  <li *ngFor="let exp of summaryResult.exposure_and_vulnerabilities" class="list-group-item small py-2">
                    <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>{{ exp }}
                  </li>
                </ul>
              </div>

              <!-- Actionable Recommendations -->
              <div>
                <div class="fw-bold small text-uppercase text-success mb-1">Actionable Recommendations for Lead Counsel</div>
                <ul class="list-group list-group-flush border rounded">
                  <li *ngFor="let rec of summaryResult.actionable_recommendations" class="list-group-item small py-2">
                    <i class="bi bi-arrow-right-circle-fill text-primary me-2"></i>{{ rec }}
                  </li>
                </ul>
              </div>
            </div>
          </app-card>
        </div>
      </div>

      <!-- TAB 3: Contract Clause Extractor -->
      <div *ngIf="activeTab === 'clause-extractor'" class="row g-4">
        <div class="col-12 col-lg-5">
          <app-card title="Contract Text Scanner">
            <p class="text-muted small">
              Automatically extract and risk-score crucial clauses: Indemnification, Liability Caps, Arbitration, Termination, and Governing Law.
            </p>

            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label fw-semibold small mb-0">Commercial Agreement Text *</label>
                <button type="button" class="btn btn-xs btn-outline-primary" (click)="loadSampleContract()">
                  Load Sample Agreement
                </button>
              </div>
              <textarea
                class="form-control form-control-sm font-monospace"
                rows="11"
                [(ngModel)]="contractText"
                placeholder="Paste contract terms or sections...">
              </textarea>
            </div>

            <button
              class="btn btn-primary btn-sm w-100 py-2"
              (click)="extractContractClauses()"
              [disabled]="isExtracting || !contractText">
              <i class="bi bi-search me-1"></i>
              {{ isExtracting ? 'Scanning Contract Clauses...' : 'Extract Key Clauses & Risk Ratings' }}
            </button>
          </app-card>
        </div>

        <div class="col-12 col-lg-7">
          <app-card title="Extracted Clauses & Risk Evaluation">
            <div *ngIf="!clauseResult" class="text-center py-5 text-muted">
              <i class="bi bi-shield-shaded display-4 text-primary opacity-50 mb-3 d-block"></i>
              <h6 class="fw-bold">No Clauses Extracted</h6>
              <p class="small mb-0">Paste contract text on the left to extract indemnification, arbitration, liability, and termination clauses.</p>
            </div>

            <div *ngIf="clauseResult">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-bold text-dark">
                  Identified {{ clauseResult.extracted_count }} Key Provisions
                </span>
                <span class="badge bg-light text-secondary border">
                  Scanned {{ clauseResult.scanned_length }} chars
                </span>
              </div>

              <div class="clauses-list d-flex flex-direction-column gap-3">
                <div *ngFor="let cl of clauseResult.clauses" class="p-3 border rounded-3 bg-white shadow-sm">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-primary">{{ cl.title }}</span>
                    <span class="badge" [ngClass]="getRiskBadgeClass(cl.risk_level)">
                      {{ cl.risk_level }}
                    </span>
                  </div>
                  <div class="p-2 bg-light rounded text-muted font-monospace small mb-2" style="font-size: 11px;">
                    "{{ cl.excerpt }}"
                  </div>
                  <div class="small text-dark">
                    <strong>Counsel Analysis:</strong> {{ cl.analysis }}
                  </div>
                </div>
              </div>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-assistant-page {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .btn-xs {
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      border-radius: 4px;
    }
    .clauses-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `]
})
export class AiAssistantComponent implements OnInit {
  activeTab: 'statute-finder' | 'time-polisher' | 'summarizer' | 'clause-extractor' = 'statute-finder';

  // AI Configuration State (Zero-Cost & Free Tiers)
  showSettingsModal: boolean = false;
  aiProvider: string = 'auto';
  aiApiKey: string = '';
  ollamaUrl: string = 'http://localhost:11434';

  // Tab 0: Indian Statute & Penal Code Finder (BNS / IPC / BNSS)
  statuteQuery: string = 'what is the section for pickpocket';
  isSearchingStatute: boolean = false;
  statuteResult: IndianStatuteResponse | null = null;

  // Tab 1: Time Polisher
  rawTimeNote: string = 'call apex director about port cargo shipment';
  matterContext: string = 'Apex Global Logistics v. QuickFreight (Comm. O.S. 481/2026)';
  clientContext: string = 'Apex Global Logistics India Pvt Ltd';
  isPolishing: boolean = false;
  polishedTimeResult: PolishedTimeResponse | null = null;
  cases: Case[] = [];

  // Tab 2: Summarizer
  docType: string = 'Deposition Transcript';
  docText: string = '';
  isSummarizing: boolean = false;
  summaryResult: DocumentSummaryResponse | null = null;

  // Tab 3: Clause Extractor
  contractText: string = '';
  isExtracting: boolean = false;
  clauseResult: ClauseExtractionResponse | null = null;

  constructor(
    private aiService: AiAssistantService,
    private timeService: TimeTrackingService,
    private caseService: CaseService,
    private notify: NotificationService
  ) {}

  get activeEngineBadge(): string {
    switch (this.aiProvider) {
      case 'gemini': return 'Gemini 1.5 Flash [100% Free Tier]';
      case 'groq': return 'Groq Llama-3.3 [100% Free Tier]';
      case 'openrouter': return 'OpenRouter Free Models [Zero Cost]';
      case 'ollama': return 'Local Ollama [100% Free Offline]';
      case 'openai': return 'OpenAI GPT-4o';
      default: return 'Built-in Engine [100% Free $0.00]';
    }
  }

  getApiKeyLabel(): string {
    switch (this.aiProvider) {
      case 'gemini': return 'Google Gemini API Key (100% Free Tier)';
      case 'groq': return 'Groq Cloud API Key (100% Free Tier)';
      case 'openrouter': return 'OpenRouter API Key (Free Models)';
      case 'openai': return 'OpenAI API Key';
      default: return 'API Key';
    }
  }

  getApiKeyPlaceholder(): string {
    switch (this.aiProvider) {
      case 'gemini': return 'AIzaSy... (Free at aistudio.google.com)';
      case 'groq': return 'gsk_... (Free at console.groq.com)';
      case 'openrouter': return 'sk-or-... (Free at openrouter.ai)';
      default: return 'Paste your API key here';
    }
  }

  getFreeKeyLink(): string | null {
    switch (this.aiProvider) {
      case 'gemini': return 'https://aistudio.google.com/app/apikey';
      case 'groq': return 'https://console.groq.com/keys';
      case 'openrouter': return 'https://openrouter.ai/keys';
      default: return null;
    }
  }

  ngOnInit(): void {
    // Restore saved AI configuration
    const savedProvider = localStorage.getItem('justiceflow_ai_provider');
    if (savedProvider) this.aiProvider = savedProvider;
    const savedKey = localStorage.getItem('justiceflow_ai_key');
    if (savedKey) this.aiApiKey = savedKey;
    const savedOllama = localStorage.getItem('justiceflow_ollama_url');
    if (savedOllama) this.ollamaUrl = savedOllama;

    // Automatically trigger initial search for user query (e.g. pickpocketing)
    this.searchStatute();

    this.caseService.getCases({ limit: 10 }).subscribe({
      next: (res) => {
        this.cases = res.data;
      }
    });
  }

  saveAiSettings(): void {
    localStorage.setItem('justiceflow_ai_provider', this.aiProvider);
    if (this.aiApiKey) {
      localStorage.setItem('justiceflow_ai_key', this.aiApiKey);
    } else {
      localStorage.removeItem('justiceflow_ai_key');
    }
    if (this.ollamaUrl) {
      localStorage.setItem('justiceflow_ollama_url', this.ollamaUrl);
    }
    this.showSettingsModal = false;
    this.notify.success(`Zero-Cost AI Engine set to: ${this.activeEngineBadge}`);
    this.searchStatute();
  }

  onProviderChange(): void {
    if (this.aiProvider === 'auto') {
      this.aiApiKey = '';
    }
  }

  // --- STATUTE FINDER METHODS ---
  searchStatute(): void {
    if (!this.statuteQuery || !this.statuteQuery.trim()) return;
    this.isSearchingStatute = true;

    this.aiService.searchStatute({
      query: this.statuteQuery,
      apiKey: this.aiApiKey || undefined,
      options: {
        provider: this.aiProvider,
        ollamaUrl: this.ollamaUrl
      }
    }).subscribe({
      next: (res) => {
        this.isSearchingStatute = false;
        if (res.success) {
          this.statuteResult = res.data;
          this.notify.success('Indian legal statutory analysis loaded!');
        }
      },
      error: (err) => {
        this.isSearchingStatute = false;
        this.notify.error('Failed to query Indian statutes: ' + (err.error?.message || err.message));
      }
    });
  }

  setStatuteQuery(q: string): void {
    this.statuteQuery = q;
    this.searchStatute();
  }

  copyStatuteAnalysis(): void {
    if (!this.statuteResult) return;
    const r = this.statuteResult;
    const text = `JUSTICEFLOW LEGAL ADVISORY MEMO\n` +
      `TOPIC: ${r.title}\n` +
      `QUERY: "${r.query}"\n` +
      `CURRENT LAW (BNS 2023): ${r.bnsSection || 'N/A'}\n` +
      `HISTORIC LAW (IPC 1860): ${r.ipcSection || 'N/A'}\n` +
      `CLASSIFICATION: ${r.offenceType || 'N/A'}\n` +
      `TRIABLE BY: ${r.triableBy || 'N/A'}\n` +
      `PUNISHMENT: ${r.punishment || 'N/A'}\n` +
      `PROCEDURAL LAW: ${r.procedureCode || 'N/A'}\n` +
      (r.landmarkJudgments ? `LANDMARK PRECEDENTS:\n${r.landmarkJudgments.join('\n')}` : '');

    navigator.clipboard.writeText(text).then(() => {
      this.notify.success('Statutory citations copied to clipboard!');
    });
  }

  printStatuteAnalysis(): void {
    window.print();
  }

  getOffenceTypePart(index: number): string {
    if (!this.statuteResult?.offenceType) return index === 0 ? 'Cognizable' : 'Non-Bailable';
    const parts = this.statuteResult.offenceType.split(',');
    return parts[index]?.trim() || (index === 0 ? 'Cognizable' : 'Non-Bailable');
  }

  isCompoundable(): boolean {
    return !!this.statuteResult?.offenceType?.includes('Compoundable');
  }

  getJudgmentCitation(j: string): string {
    return j.split(' - ')[0] || j;
  }

  getJudgmentSummary(j: string): string {
    const parts = j.split(' - ');
    return parts.length > 1 ? parts.slice(1).join(' - ') : '';
  }

  setQuickPrompt(prompt: string): void {
    this.rawTimeNote = prompt;
    this.polishTimeNote();
  }

  polishTimeNote(): void {
    if (!this.rawTimeNote) return;
    this.isPolishing = true;

    this.aiService.polishTimeSlip({
      rawNote: this.rawTimeNote,
      matter: this.matterContext,
      client: this.clientContext,
      hours: 0.8
    }).subscribe({
      next: (res) => {
        this.isPolishing = false;
        if (res.success) {
          this.polishedTimeResult = res.data;
          this.notify.success('Time slip converted to LEDES billing standard!');
        }
      },
      error: (err) => {
        this.isPolishing = false;
        this.notify.error('Polishing failed: ' + (err.error?.message || err.message));
      }
    });
  }

  copyPolishedText(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.notify.success('Polished description copied to clipboard!');
    });
  }

  saveToTimeTracking(): void {
    if (!this.polishedTimeResult) return;
    const caseId = this.cases[0]?.id || 1;

    this.timeService.logTime({
      case_id: caseId,
      description: `[LEDES ${this.polishedTimeResult.ledes_code}] ${this.polishedTimeResult.polished_description}`,
      hours: this.polishedTimeResult.suggested_hours,
      hourly_rate: 4500,
      entry_date: new Date().toISOString().substring(0, 10),
      is_billable: true
    }).subscribe({
      next: () => {
        this.notify.success('Polished entry saved directly to firm Time Slips docket!');
      },
      error: () => {
        this.notify.error('Failed to save time slip');
      }
    });
  }

  loadSampleDeposition(): void {
    this.docText = `CROSS-EXAMINATION BEFORE HON'BLE ADVOCATE COMMISSIONER:
Q: Mr. Miller, you are the Chief Freight Operations Officer for QuickFreight Multi-Modal Logistics, correct?
A: Yes, that is accurate.
Q: And on April 12, 2026, did your control room receive telemetry alerts regarding Container Set #441?
A: We received multiple digital temperature sensor pings indicating the ambient cargo temperature rose above 4 degrees Celsius.
Q: That was 48 hours prior to vessel berthing at Chennai Port / JNPT Terminal, correct?
A: Yes, roughly 48 hours.
Q: Did your operations team activate the secondary diesel backup refrigeration generator as mandated under Section 9.2 of the Carriage Protocol?
A: No, the technician dispatched treated it as an electronic calibration error, so secondary backup power was never initiated.
Q: And as a direct consequence, the temperature-sensitive pharmaceutical consignment spoiled, correct?
A: The consignee issued a notice of rejection under the Carriage by Road Act upon port gate inspection.`;
    this.notify.info('Loaded witness cross-examination testimony of Chief Freight Officer David Miller');
  }

  summarizeDoc(): void {
    if (!this.docText) return;
    this.isSummarizing = true;

    this.aiService.summarizeDocument({
      text: this.docText,
      docType: this.docType
    }).subscribe({
      next: (res) => {
        this.isSummarizing = false;
        if (res.success) {
          this.summaryResult = res.data;
          this.notify.success('1-Page Executive Brief generated!');
        }
      },
      error: (err) => {
        this.isSummarizing = false;
        this.notify.error('Summarization failed');
      }
    });
  }

  printBrief(): void {
    window.print();
  }

  loadSampleContract(): void {
    this.contractText = `CLAUSE 8. INDEMNIFICATION AND HOLD HARMLESS.
Client and Service Provider mutually agree to defend, indemnify, and hold harmless each other against any third-party claims, liabilities, losses, damages, and Advocate legal costs arising out of gross negligence, wilful misconduct, or material breach of this Agreement.

CLAUSE 9. LIMITATION OF LIABILITY.
In no event shall either party be liable for any indirect, special, incidental, or consequential damages. Total aggregate liability under this Agreement shall not exceed total fees paid in preceding 12 months.

CLAUSE 10. DISPUTE RESOLUTION AND INDIAN INSTITUTIONAL ARBITRATION.
Any dispute or difference arising out of or in connection with this contract shall be referred to and finally resolved by binding arbitration administered under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Bengaluru / New Delhi, India.

CLAUSE 11. TERMINATION.
Either party may terminate upon thirty (30) days prior written notice, or immediately upon written notice if the other party breaches any material term and fails to cure within fifteen (15) days.

CLAUSE 12. GOVERNING LAW & JURISDICTION.
This Agreement shall be governed by and construed in accordance with the substantive laws of the Republic of India. The Commercial Courts and High Court of Karnataka shall have exclusive jurisdiction.`;
    this.notify.info('Loaded Indian standard commercial agreement clauses');
  }

  extractContractClauses(): void {
    if (!this.contractText) return;
    this.isExtracting = true;

    this.aiService.extractClauses({
      contractText: this.contractText
    }).subscribe({
      next: (res) => {
        this.isExtracting = false;
        if (res.success) {
          this.clauseResult = res.data;
          this.notify.success(`Extracted ${res.data.extracted_count} key contract clauses with risk ratings!`);
        }
      },
      error: (err) => {
        this.isExtracting = false;
        this.notify.error('Extraction failed');
      }
    });
  }

  getRiskBadgeClass(level: string): string {
    switch (level) {
      case 'High Risk': return 'bg-danger';
      case 'Medium Risk': return 'bg-warning text-dark';
      case 'Standard': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}
