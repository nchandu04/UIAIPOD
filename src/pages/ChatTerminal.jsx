import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AGENTS } from '../lib/agents'
import {
  Send, Bot, User, Users, ChevronDown, ChevronRight,
  CircleCheck as CheckCircle, Clock, Zap, MessageSquare,
  TriangleAlert as AlertTriangle, ArrowLeft, Terminal,
  Activity, Check, X, ChartBar as BarChart2, Timer, RefreshCw,
  FileText, Database, BookOpen, Link, Shield, Eye,
} from 'lucide-react'

// ─── POC Pipeline ───────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { step: 1, label: 'Intent Classification & Routing', type: 'routing',     duration: 480,  component: 'Agent Router + Agent Registry',    detail: 'Parsing multi-intent NL prompt. Extracting primary intent (initiate_asa) and secondary intents. Querying Agent Registry Discovery API. Scoring candidate agents against capability declarations. Selecting ASA Creation Agent (staging tier).' },
  { step: 2, label: 'CPF & Knowledge Retrieval',       type: 'rag',         duration: 1800, component: 'RAG / Knowledge Engine',            detail: 'Executing 4 targeted hybrid search queries against Azure AI Search index (CPF pillars · RAS governance · prior analytical work · global good practice). Applying cross-encoder reranking. Enforcing document-level ACL. Returning ranked chunks with source citations.' },
  { step: 3, label: 'Portfolio Overlap Analysis',      type: 'tool',        duration: 1200, component: 'Dataverse Connector + Azure SQL',   detail: 'Querying OW Dataverse for active and pipeline India MTI ASAs tagged CC, FP, PDM. Invoking Azure SQL Connector for financial summary data. Identifying overlap risks and duplication scope. Validating tool grants via Tool Registry.' },
  { step: 4, label: 'Concept Note Generation',         type: 'synthesis',   duration: 2400, component: 'RAG + SharePoint Connector',        detail: 'Retrieving WBG ASA Concept Note template from SharePoint template library. Composing structured Concept Note using CPF context (Step 2), portfolio findings (Step 3), RAS policy references, and analytical framework. Embedding inline citations from retrieved chunks.' },
  { step: 5, label: 'Dataverse Record Population',     type: 'tool',        duration: 900,  component: 'Dataverse Connector',               detail: 'Creating new ASA record in OW Dataverse staging environment. Validating all field values against ASA entity schema. Writing: ASA title, type (RAS), country (India), GP (MTI), topic codes (CC, FP, PDM), budget (USD 450,000), delivery (18 months), client (MoF India), status (Draft/Concept Stage). Returning ASA record ID.' },
  { step: 6, label: 'SharePoint Upload & Tagging',     type: 'tool',        duration: 700,  component: 'SharePoint Connector + Dataverse',  detail: 'Uploading generated ASA Concept Note draft to India MTI practice SharePoint library. Applying metadata tags: ASA record ID, country (India), GP (MTI), document type (ASA Concept Note), ASA type (RAS), topic codes (CC, FP), status (Draft). Writing SharePoint URL back to Dataverse record.' },
  { step: 7, label: 'HITL Review Gate',                type: 'hitl',        duration: 0,    component: 'Orchestration Engine',              detail: 'Surfacing structured review package to TTL. Awaiting explicit Accept or Reject before record is promoted from Draft to Submitted. Gate is non-bypassable.' },
  { step: 8, label: 'Audit & Observability Logging',   type: 'audit',       duration: 300,  component: 'Governance Layer',                  detail: 'Writing full execution trace to observability dashboard: routing decision log, RAG query logs with reranking scores, all 6 connector invocations with inputs/outputs/latency, HITL gate decision. Execution logged as auditable event in Agent Registry.' },
]

const STEP_COLORS = {
  routing:   'text-[#005fa3] bg-[#dceef9]',
  rag:       'text-[#0063a3] bg-[#e8f4fc]',
  tool:      'text-[#00a651] bg-[#e6f7ee]',
  synthesis: 'text-[#3d6b3a] bg-[#d8f0d5]',
  hitl:      'text-[#c07800] bg-[#fff8e6]',
  audit:     'text-[#5c6670] bg-[#f0f4f8]',
  system:    'text-[#8a95a0] bg-[#f0f4f8]',
  safety:    'text-[#c0392b] bg-[#fdf2f1]',
}

const CONFIDENCE_THRESHOLD = 0.72

// ─── Mock data generators ─────────────────────────────────────────────────

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a
}

function generateRoutingDecision() {
  const score = 0.91
  return {
    candidates: [
      { name: 'ASA Creation Agent',       score: 0.91, intents: ['initiate_asa', 'check_cpf_alignment', 'scan_portfolio_overlap', 'generate_concept_note', 'populate_dataverse_record', 'upload_to_sharepoint'], selected: true },
      { name: 'Portfolio Analytics Agent', score: 0.47, intents: ['scan_portfolio', 'detect_overlap'], selected: false },
      { name: 'Knowledge Retrieval Agent', score: 0.38, intents: ['retrieve_cpf_context', 'find_prior_analytical_work'], selected: false },
    ],
    selectedScore: score,
    rationale: 'Detected 6 intents (initiate_asa, check_cpf_alignment, scan_portfolio_overlap, generate_concept_note, populate_dataverse_record, upload_to_sharepoint). ASA Creation Agent matches all 6 declared intents with 91% confidence, tool grants cover all required connectors, approval status Approved, environment tier: staging. Multi-criteria routing factors: capability score 0.91 · approval gate PASSED · tool coverage 4/4 · latency estimate 6.5s.',
    belowThreshold: false,
    detectedIntents: ['initiate_asa', 'check_cpf_alignment', 'scan_portfolio_overlap', 'generate_concept_note', 'populate_dataverse_record', 'upload_to_sharepoint'],
  }
}

const RAG_RESULTS = [
  { id: 'chunk-001', document: 'India Country Partnership Framework FY2018–22 (Updated FY2023)', url: 'https://sharepoint.worldbank.org/sites/india-mti/cpf-fy2023.pdf', page: 14, score: 0.94, bm25: 0.88, vector: 0.97, text: 'Pillar 2 of the India CPF focuses on resource efficiency and climate resilience, with emphasis on climate-smart fiscal management and sustainable public finance frameworks aligned with India\'s NDC commitments and Green Climate Fund protocols.' },
  { id: 'chunk-002', document: 'WBG RAS Operational Guidelines — Reimbursable Advisory Services', url: 'https://sharepoint.worldbank.org/sites/ras-ops/guidelines-2024.pdf', page: 6, score: 0.91, bm25: 0.85, vector: 0.94, text: 'RAS engagements with ministries of finance require a Concept Note approved by the Practice Manager prior to client negotiation. Budget recovery arrangements must be documented and the engagement classified under the appropriate ASA instrument code.' },
  { id: 'chunk-003', document: 'Climate Fiscal Risk Assessment Framework — Global Practice ESW (2023)', url: 'https://documentum.worldbank.org/docs/climate-fiscal-risk-2023.pdf', page: 3, score: 0.89, bm25: 0.81, vector: 0.93, text: 'Climate fiscal risk assessments should integrate physical risk (asset damage, revenue volatility), transition risk (stranded assets, carbon pricing), and contingent liability exposure into a unified debt sustainability framework applicable to middle-income sovereign contexts.' },
  { id: 'chunk-004', document: 'India: Public Debt Sustainability Analysis under Climate Scenarios — ICR (2022)', url: 'https://documentum.worldbank.org/docs/india-debt-climate-icr-2022.pdf', page: 8, score: 0.85, bm25: 0.78, vector: 0.89, text: 'Under a 2°C scenario, India\'s debt-to-GDP ratio is projected to increase by 4.2–6.8 pp by 2035 due to increased adaptation expenditure and reduced revenue base. Fiscal buffers equivalent to 1.5% of GDP annually are recommended for climate contingency reserves.' },
]

const TOOL_INVOCATIONS = [
  { step: 2, tool: 'Knowledge Engine API',  op: 'hybrid_search', agent_id: 'agt-ow-001', input: { query: 'India CPF climate resilience fiscal sustainability', country: 'India', doc_types: ['CPF'], top_k: 10, rerank: true }, status: 'success', latency_ms: 423, chunks_returned: 4 },
  { step: 2, tool: 'Knowledge Engine API',  op: 'hybrid_search', agent_id: 'agt-ow-001', input: { query: 'WBG RAS governance reimbursable advisory budget requirements', doc_types: ['Policy Note'], top_k: 5, rerank: true }, status: 'success', latency_ms: 387, chunks_returned: 2 },
  { step: 2, tool: 'Knowledge Engine API',  op: 'hybrid_search', agent_id: 'agt-ow-001', input: { query: 'prior WBG analytical work climate fiscal risk sovereign debt India', country: 'India', top_k: 10, rerank: true }, status: 'success', latency_ms: 441, chunks_returned: 6 },
  { step: 2, tool: 'Knowledge Engine API',  op: 'hybrid_search', agent_id: 'agt-ow-001', input: { query: 'global good practice climate fiscal assessment middle income countries', top_k: 8, rerank: true }, status: 'success', latency_ms: 398, chunks_returned: 4 },
  { step: 3, tool: 'Dataverse Connector',   op: 'query',         agent_id: 'agt-ow-001', input: { operation: 'query', entity: 'asa_record', filters: { country: 'India', global_practice: 'MTI', topic_codes: ['CC', 'FP', 'PDM'], status: ['Active', 'Pipeline'] } }, status: 'success', latency_ms: 312, records_returned: 3 },
  { step: 3, tool: 'Azure SQL Connector',   op: 'financial_summary', agent_id: 'agt-ow-001', input: { query_type: 'financial_summary', country: 'India', global_practice: 'MTI', topic_codes: ['CC', 'FP'] }, status: 'success', latency_ms: 228, records_returned: 3 },
  { step: 4, tool: 'SharePoint Connector',  op: 'retrieve',      agent_id: 'agt-ow-001', input: { operation: 'retrieve', site_url: 'india-mti', library: 'Templates', file_name: 'WBG_ASA_Concept_Note_Template_v4.docx' }, status: 'success', latency_ms: 189, document: 'WBG_ASA_Concept_Note_Template_v4.docx' },
  { step: 5, tool: 'Dataverse Connector',   op: 'create',        agent_id: 'agt-ow-001', input: { operation: 'create', entity: 'asa_record', payload: { asa_title: 'India Climate Fiscal Risk and Public Debt Sustainability Assessment', asa_type: 'RAS', country: 'India', global_practice: 'MTI', topic_codes: ['CC', 'FP', 'PDM'], budget_usd: 450000, delivery_months: 18, client: 'Ministry of Finance, Government of India', status: 'Draft' }, validate_schema: true }, status: 'success', latency_ms: 341, record_id: 'ASA-IND-MTI-2025-0047' },
  { step: 6, tool: 'SharePoint Connector',  op: 'upload',        agent_id: 'agt-ow-001', input: { operation: 'upload', site_url: 'india-mti', library: 'ASA Concept Notes', file_name: 'India_Climate_Fiscal_Risk_ASA_ConceptNote_Draft_v1.docx', metadata: { asa_record_id: 'ASA-IND-MTI-2025-0047', country: 'India', global_practice: 'MTI', document_type: 'ASA Concept Note', asa_type: 'RAS', topic_codes: ['CC', 'FP'], status: 'Draft' } }, status: 'success', latency_ms: 267, document_url: 'https://sharepoint.worldbank.org/sites/india-mti/ASAConceptNotes/India_Climate_Fiscal_Risk_ASA_ConceptNote_Draft_v1.docx' },
  { step: 6, tool: 'Dataverse Connector',   op: 'update',        agent_id: 'agt-ow-001', input: { operation: 'update', entity: 'asa_record', record_id: 'ASA-IND-MTI-2025-0047', payload: { sharepoint_url: 'https://sharepoint.worldbank.org/sites/india-mti/ASAConceptNotes/India_Climate_Fiscal_Risk_ASA_ConceptNote_Draft_v1.docx' } }, status: 'success', latency_ms: 198, record_id: 'ASA-IND-MTI-2025-0047' },
]

const PORTFOLIO_OVERLAP = [
  { asa_id: 'ASA-IND-MTI-2023-0031', title: 'India Fiscal Consolidation and Public Finance Management TA', status: 'Active', budget_usd: 380000, ttl: 'R. Chakraborty', overlap: 'Partial — fiscal management scope overlaps; climate dimension is additive' },
  { asa_id: 'ASA-IND-MTI-2024-0012', title: 'India Green Finance Market Development ESW', status: 'Pipeline', budget_usd: 210000, ttl: 'A. Sharma', overlap: 'Complementary — green finance instrument design; no duplication on fiscal risk' },
  { asa_id: 'ASA-IND-MTI-2022-0019', title: 'South Asia Climate Resilience Fiscal Framework (Closed)', status: 'Closed', budget_usd: 520000, ttl: 'P. Mehta', overlap: 'Historical precedent — prior analytical base relevant; engagement is closed' },
]

const ASA_CONCEPT_NOTE = `**ASA CONCEPT NOTE — DRAFT v1**
_India Climate Fiscal Risk and Public Debt Sustainability Assessment_

---

**ASA Record ID:** ASA-IND-MTI-2025-0047
**Instrument:** Reimbursable Advisory Services (RAS)
**Global Practice:** Macroeconomics, Trade, and Investment (MTI)
**Country:** India · **Client:** Ministry of Finance, Government of India
**Topic Codes:** Climate Change (CC) · Fiscal Policy (FP) · Public Debt Management (PDM)
**Budget:** USD 450,000 · **Timeline:** 18 months
**Outputs:** Flagship Policy Note (Month 12) · Technical Background Papers ×2 (Months 8, 10) · Stakeholder Workshop (Month 14)

---

**Development Objective**
To assess the fiscal risks posed by climate change — including physical risk, transition risk, and contingent liability exposure — and their implications for India's public debt trajectory and medium-term fiscal framework, providing the Ministry of Finance with an analytical foundation for integrating climate considerations into fiscal planning and debt management.

**Strategic Rationale & CPF Alignment**
Grounded in India CPF Pillar 2 (Resource Efficiency & Climate Resilience) and Pillar 3 (Inclusion and Sustainability). [Source: India CPF FY2018–22 Updated FY2023, p.14] Directly supports India's NDC commitments and the MoF's ongoing medium-term expenditure framework reform.

**Analytical Framework**
Climate scenario modelling (1.5°C, 2°C, 3°C) combined with debt sustainability analysis (DSA) under climate shocks, and institutional assessment of climate budget tagging practices. Builds on prior WBG ESW: under 2°C, India's debt-to-GDP increases 4.2–6.8pp by 2035. [Source: India Public Debt Sustainability ICR 2022, p.8]

**Client Engagement & RAS Governance**
Ministry of Finance engagement structure per RAS Operational Guidelines. [Source: WBG RAS Guidelines 2024, p.6] Cost recovery arrangements to be documented pre-negotiation. PM approval required before client engagement.

**SharePoint URL:** https://sharepoint.worldbank.org/sites/india-mti/ASAConceptNotes/India_Climate_Fiscal_Risk_ASA_ConceptNote_Draft_v1.docx`

function buildPipelineSteps() {
  return PIPELINE_STEPS.map(t => ({
    ...t,
    duration: t.duration > 0 ? randomBetween(t.duration - 100, t.duration + 400) : 0,
    status: 'pending',
  }))
}

// ─── RAG Results Panel ────────────────────────────────────────────────────
function RAGPanel({ chunks }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-[#d8dde2] rounded-xl overflow-hidden bg-white shadow-sm fade-in">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f0f8ff] hover:bg-[#e0f0fc] transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#0063a3]" />
          <span className="text-sm font-semibold text-[#002244]">Knowledge Retrieval Results</span>
          <span className="ml-2 text-xs text-[#5c6670]">{chunks.length} chunks · hybrid search + cross-encoder reranking</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-[#8a95a0]" /> : <ChevronRight className="w-4 h-4 text-[#8a95a0]" />}
      </button>
      {open && (
        <div className="divide-y divide-[#eef0f2]">
          {chunks.map((c, i) => (
            <div key={i} className="px-4 py-3 hover:bg-[#fafbfc] transition-colors">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-[#0063a3] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#002244] truncate">{c.document}</span>
                  <span className="text-[10px] text-[#8a95a0] flex-shrink-0">p.{c.page}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-[#8a95a0]">BM25 {c.bm25.toFixed(2)}</span>
                  <span className="text-[10px] text-[#8a95a0]">Vec {c.vector.toFixed(2)}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.score >= 0.9 ? 'bg-[#e6f7ee] text-[#00a651]' : 'bg-[#fff8e6] text-[#c07800]'}`}>
                    {(c.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#3d4a55] leading-relaxed mb-1.5 ml-5">{c.text}</p>
              <a href="#" className="ml-5 flex items-center gap-1 text-[10px] text-[#009fda] hover:underline w-fit">
                <Link className="w-2.5 h-2.5" />{c.url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Portfolio Overlap Panel ──────────────────────────────────────────────
function PortfolioPanel({ items }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-[#d8dde2] rounded-xl overflow-hidden bg-white shadow-sm fade-in">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#fffbf0] hover:bg-[#fff3d0] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#c07800]" />
          <span className="text-sm font-semibold text-[#002244]">Portfolio Overlap Analysis</span>
          <span className="ml-2 text-xs text-[#c07800] font-medium">{items.length} ASAs identified · India MTI · CC/FP/PDM</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-[#8a95a0]" /> : <ChevronRight className="w-4 h-4 text-[#8a95a0]" />}
      </button>
      {open && (
        <div className="divide-y divide-[#eef0f2]">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-[#8a95a0]">{item.asa_id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.status === 'Active' ? 'bg-[#e6f7ee] text-[#00a651]' : item.status === 'Pipeline' ? 'bg-[#e8f4fc] text-[#0063a3]' : 'bg-[#f0f4f8] text-[#8a95a0]'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1a2430] mb-0.5">{item.title}</p>
                <p className="text-[11px] text-[#5c6670]">TTL: {item.ttl} · USD {(item.budget_usd / 1000).toFixed(0)}k</p>
                <p className="text-[11px] text-[#c07800] mt-0.5 flex items-start gap-1"><AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />{item.overlap}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Process Log Panel ────────────────────────────────────────────────────
function ProcessLogPanel({ steps, isRunning, currentStepIndex }) {
  const [open, setOpen] = useState(true)
  const completedCount = steps.filter(s => s.status === 'completed').length

  return (
    <div className="border border-[#d8dde2] rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-[#eef0f2] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0063a3]" />
          <span className="text-sm font-semibold text-[#002244]">Execution Pipeline</span>
          {isRunning && currentStepIndex >= 0 && (
            <span className="flex items-center gap-1.5 text-xs text-[#009fda] ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009fda] animate-pulse" />
              Step {steps[currentStepIndex]?.step}: {steps[currentStepIndex]?.label}...
            </span>
          )}
          {!isRunning && completedCount > 0 && (
            <span className="text-xs text-[#00a651] ml-2 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {completedCount}/{steps.length} steps completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning && <div className="flex gap-0.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>}
          {open ? <ChevronDown className="w-4 h-4 text-[#8a95a0]" /> : <ChevronRight className="w-4 h-4 text-[#8a95a0]" />}
        </div>
      </button>
      {open && (
        <div className="divide-y divide-[#eef0f2]">
          {steps.map(step => (
            <div key={step.step} className={`flex items-start gap-3 px-4 py-3 transition-all ${step.status === 'running' ? 'bg-[#f0f8ff]' : ''}`}>
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-[#00a651]" />}
                {step.status === 'running'   && <RefreshCw   className="w-4 h-4 text-[#009fda] animate-spin" />}
                {step.status === 'pending'   && <div className="w-4 h-4 rounded-full border-2 border-[#d8dde2]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STEP_COLORS[step.type] || ''}`}>{step.type}</span>
                  <span className="text-xs font-semibold text-[#1a2430]">Step {step.step} — {step.label}</span>
                  <span className="text-[10px] text-[#8a95a0]">{step.component}</span>
                  {step.status === 'completed' && step.duration > 0 && (
                    <span className="text-xs text-[#8a95a0] ml-auto">{step.duration}ms</span>
                  )}
                </div>
                <p className="text-xs text-[#5c6670] leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Routing Decision Panel ───────────────────────────────────────────────
function RoutingDecisionPanel({ routing }) {
  const [open, setOpen] = useState(true)
  const { candidates, rationale, detectedIntents } = routing
  return (
    <div className="border border-[#d8dde2] rounded-xl overflow-hidden bg-white shadow-sm fade-in">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-[#eef0f2] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0063a3]" />
          <span className="text-sm font-semibold text-[#002244]">Routing Decision Log</span>
          <span className="text-xs text-[#00a651] ml-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" />High confidence</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-[#8a95a0]" /> : <ChevronRight className="w-4 h-4 text-[#8a95a0]" />}
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-2">Detected Intents ({detectedIntents.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {detectedIntents.map((intent, i) => (
                <code key={i} className="text-[10px] px-2 py-0.5 bg-[#e8f4fc] text-[#0063a3] rounded font-mono border border-[#d0e8f5]">{intent}</code>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {candidates.map((c, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${c.selected ? 'border-[#009fda] bg-[#f0f8ff]' : 'border-[#eef0f2] bg-[#fafbfc]'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold truncate ${c.selected ? 'text-[#002244]' : 'text-[#5c6670]'}`}>{c.name}</span>
                    {c.selected && <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#009fda] text-white">SELECTED</span>}
                    <span className="text-[10px] text-[#8a95a0] ml-auto">intents matched: {c.intents.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#eef0f2] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.selected ? 'bg-[#009fda]' : 'bg-[#b0b8c1]'}`} style={{ width: `${Math.round(c.score * 100)}%` }} />
                    </div>
                    <span className={`text-[11px] font-bold w-10 text-right ${c.score >= CONFIDENCE_THRESHOLD ? 'text-[#00a651]' : 'text-[#c0392b]'}`}>{Math.round(c.score * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 text-xs leading-relaxed bg-[#f0f8ff] text-[#1a3a5c] border border-[#009fda]/20">
            <span className="font-semibold">Rationale: </span>{rationale}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Escalation Panel ─────────────────────────────────────────────────────
function EscalationPanel({ onEscalate, onProceed }) {
  return (
    <div className="border-2 border-[#f5a623] rounded-xl bg-[#fffbf0] shadow-sm fade-in overflow-hidden">
      <div className="px-4 py-3 bg-[#f5a623]/10 border-b border-[#f5a623]/30 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#c07800]" />
        <span className="text-sm font-semibold text-[#7a4e00]">Low Confidence — Human Escalation Required</span>
        <span className="ml-auto text-xs text-[#a06800]">Score &lt; {Math.round(CONFIDENCE_THRESHOLD * 100)}%</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#5c6670] mb-4">The router could not confidently match this request. Please choose how to proceed:</p>
        <div className="flex gap-3">
          <button onClick={onProceed} className="flex items-center gap-2 px-4 py-2 bg-[#009fda] text-white text-sm font-semibold rounded-lg hover:bg-[#0087bf] transition-colors flex-1 justify-center">
            <Check className="w-4 h-4" /> Proceed Anyway
          </button>
          <button onClick={onEscalate} className="flex items-center gap-2 px-4 py-2 bg-[#002244] text-white text-sm font-semibold rounded-lg hover:bg-[#003366] transition-colors flex-1 justify-center">
            <Users className="w-4 h-4" /> Escalate to Operator
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── HITL Panel ───────────────────────────────────────────────────────────
function HITLPanel({ asaNote, portfolioItems, ragChunks, routingLog, toolLog, onAccept, onReject }) {
  const [notes, setNotes] = useState('')
  const [deciding, setDeciding] = useState(false)
  const [tab, setTab] = useState('concept_note')

  const TABS = [
    { id: 'concept_note', label: 'Concept Note Draft', icon: FileText },
    { id: 'portfolio',    label: 'Portfolio Findings', icon: Database },
    { id: 'routing',      label: 'Routing Log',         icon: Activity },
    { id: 'tool_audit',   label: 'Tool Audit Trail',    icon: Shield },
  ]

  return (
    <div className="border-2 border-[#f5a623] rounded-xl bg-[#fffbf0] shadow-sm fade-in overflow-hidden">
      <div className="px-4 py-3 bg-[#f5a623]/10 border-b border-[#f5a623]/30 flex items-center gap-2 flex-wrap">
        <AlertTriangle className="w-4 h-4 text-[#c07800]" />
        <span className="text-sm font-semibold text-[#7a4e00]">Step 7 — HITL Review Gate</span>
        <span className="ml-auto text-xs text-[#a06800] font-mono">ASA-IND-MTI-2025-0047 · Draft</span>
      </div>

      <div className="px-4 pt-3 pb-1 border-b border-[#f5a623]/20">
        <p className="text-xs text-[#5c6670] mb-3">
          Review the generated Concept Note, CPF alignment, portfolio findings, routing decision log, and tool invocation audit trail before promoting the ASA record from <strong>Draft</strong> to <strong>Submitted</strong>.
        </p>
        <div className="flex gap-1 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t.id ? 'bg-[#002244] text-white' : 'bg-white border border-[#e8d99a] text-[#5c6670] hover:text-[#002244]'}`}
            >
              <t.icon className="w-3 h-3" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {tab === 'concept_note' && (
          <div className="bg-white border border-[#e8d99a] rounded-lg p-4 max-h-72 overflow-y-auto">
            <pre className="text-xs text-[#1a2430] whitespace-pre-wrap leading-relaxed font-sans">{asaNote}</pre>
          </div>
        )}

        {tab === 'portfolio' && (
          <div className="space-y-2">
            <div className="bg-[#fff8e6] border border-[#f5a623]/30 rounded-lg px-3 py-2 mb-2">
              <p className="text-xs text-[#7a4e00] font-semibold">3 overlapping ASAs identified in India MTI portfolio (CC/FP/PDM filter). Review for duplication risks before submission.</p>
            </div>
            {portfolioItems.map((item, i) => (
              <div key={i} className="bg-white border border-[#e0e6eb] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-[#8a95a0]">{item.asa_id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.status === 'Active' ? 'bg-[#e6f7ee] text-[#00a651]' : item.status === 'Pipeline' ? 'bg-[#e8f4fc] text-[#0063a3]' : 'bg-[#f0f4f8] text-[#8a95a0]'}`}>{item.status}</span>
                </div>
                <p className="text-xs font-semibold text-[#1a2430] mb-0.5">{item.title}</p>
                <p className="text-[11px] text-[#5c6670]">TTL: {item.ttl} · USD {(item.budget_usd / 1000).toFixed(0)}k</p>
                <p className="text-[11px] text-[#c07800] mt-1">{item.overlap}</p>
              </div>
            ))}
            <div className="bg-[#fdf2f1] border border-[#c0392b]/20 rounded-lg px-3 py-2">
              <p className="text-xs text-[#c0392b] font-semibold">Alignment Flags for TTL Review</p>
              <ul className="mt-1 space-y-1">
                <li className="text-xs text-[#3d4a55]">• Partial scope overlap with ASA-IND-MTI-2023-0031 — confirm additionality narrative in Concept Note Section 3.</li>
                <li className="text-xs text-[#3d4a55]">• RAS cost recovery arrangement not yet documented — required before Practice Manager approval.</li>
                <li className="text-xs text-[#3d4a55]">• CPF FY2023 update covers climate resilience but fiscal risk assessment is not explicitly listed — add CPF alignment justification.</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'routing' && (
          <div className="space-y-3">
            <div className="bg-white border border-[#e0e6eb] rounded-lg p-3">
              <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-2">Routing Decision Summary</p>
              <div className="space-y-1.5">
                <div className="flex gap-2 text-xs"><span className="text-[#8a95a0] w-32 flex-shrink-0">Selected Agent</span><span className="font-semibold text-[#002244]">ASA Creation Agent (agt-ow-001)</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[#8a95a0] w-32 flex-shrink-0">Confidence Score</span><span className="font-semibold text-[#00a651]">91%</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[#8a95a0] w-32 flex-shrink-0">Intents Matched</span><span className="font-semibold text-[#002244]">6 / 6</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[#8a95a0] w-32 flex-shrink-0">Approval Gate</span><span className="font-semibold text-[#00a651]">PASSED</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[#8a95a0] w-32 flex-shrink-0">Tool Coverage</span><span className="font-semibold text-[#002244]">4/4 required tools granted</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[#8a95a0] w-32 flex-shrink-0">Environment</span><span className="font-semibold text-[#002244]">Staging</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[#8a95a0] w-32 flex-shrink-0">Fallback Agent</span><span className="font-semibold text-[#5c6670]">Portfolio Analytics Agent (score: 47%)</span></div>
              </div>
            </div>
            <div className="bg-[#f0f8ff] border border-[#009fda]/20 rounded-lg px-3 py-2 text-xs text-[#1a3a5c] leading-relaxed">
              <span className="font-semibold">Full Rationale: </span>Detected 6 intents from multi-sentence NL prompt. ASA Creation Agent matched all 6 declared intents with 91% confidence. Multi-criteria routing: capability score 0.91 · approval status Approved · tool grant coverage 4/4 · agent health OK · latency estimate 6.5s · environment tier staging. No fallback chain activated.
            </div>
          </div>
        )}

        {tab === 'tool_audit' && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {toolLog.map((inv, i) => (
              <div key={i} className="bg-white border border-[#e0e6eb] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold text-[#002244] bg-[#e8f4fc] px-1.5 py-0.5 rounded">Step {inv.step}</span>
                  <span className="text-xs font-semibold text-[#002244]">{inv.tool}</span>
                  <span className="text-[10px] text-[#5c6670]">op: {inv.op}</span>
                  <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${inv.status === 'success' ? 'bg-[#e6f7ee] text-[#00a651]' : 'bg-[#fdf2f1] text-[#c0392b]'}`}>{inv.status}</span>
                  <span className="text-[10px] text-[#8a95a0]">{inv.latency_ms}ms</span>
                </div>
                <div className="text-[10px] font-mono text-[#5c6670] bg-[#f8f9fa] rounded px-2 py-1 overflow-x-auto whitespace-nowrap">
                  {JSON.stringify(inv.input).slice(0, 120)}{JSON.stringify(inv.input).length > 120 ? '…' : ''}
                </div>
                {inv.record_id && <p className="text-[10px] text-[#00a651] mt-1 font-mono">→ record_id: {inv.record_id}</p>}
                {inv.document_url && <p className="text-[10px] text-[#0063a3] mt-1 truncate font-mono">→ {inv.document_url}</p>}
                {inv.chunks_returned !== undefined && <p className="text-[10px] text-[#5c6670] mt-1">→ {inv.chunks_returned} chunks returned</p>}
                {inv.records_returned !== undefined && <p className="text-[10px] text-[#5c6670] mt-1">→ {inv.records_returned} records returned</p>}
              </div>
            ))}
          </div>
        )}

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="TTL reviewer notes (optional — recorded in audit log)..."
          rows={2}
          className="w-full px-3 py-2 mt-3 rounded-lg border border-[#e8d99a] bg-white text-sm resize-none focus:outline-none focus:border-[#f5a623] focus:ring-2 focus:ring-[#f5a623]/20 transition-all"
        />
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => { setDeciding(true); onAccept(notes) }}
            disabled={deciding}
            className="flex items-center gap-2 px-5 py-2 bg-[#00a651] text-white text-sm font-semibold rounded-lg hover:bg-[#008843] transition-colors disabled:opacity-60 flex-1 justify-center"
          >
            <Check className="w-4 h-4" /> Approve & Submit ASA
          </button>
          <button
            onClick={() => { setDeciding(true); onReject(notes) }}
            disabled={deciding}
            className="flex items-center gap-2 px-5 py-2 bg-[#c0392b] text-white text-sm font-semibold rounded-lg hover:bg-[#a02e23] transition-colors disabled:opacity-60 flex-1 justify-center"
          >
            <X className="w-4 h-4" /> Reject & Revise
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Observability Dashboard ──────────────────────────────────────────────
function ObservabilityPanel({ session, messages, processSteps, toolLog, ragChunks }) {
  const totalMs = session.completedAt - session.startedAt
  const doneSteps = processSteps.filter(s => s.status === 'completed' && s.duration > 0)
  const avgStepMs = doneSteps.length ? Math.round(doneSteps.reduce((a, s) => a + s.duration, 0) / doneSteps.length) : 0
  const totalToolLatency = toolLog.reduce((a, t) => a + t.latency_ms, 0)

  return (
    <div className="bg-white border border-[#d8dde2] rounded-xl shadow-sm overflow-hidden fade-in">
      <div className="px-5 py-4 border-b border-[#eef0f2] bg-[#002244] flex items-center gap-2">
        <Eye className="w-4 h-4 text-[#009fda]" />
        <h3 className="font-semibold text-white text-sm">Step 8 — Audit & Observability Dashboard</h3>
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-[#00a651]/20 text-[#4cc180]">completed</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#eef0f2]">
        {[
          { icon: Timer,        label: 'Total Execution', value: `${(totalMs / 1000).toFixed(1)}s`,   color: 'text-[#0063a3]' },
          { icon: Zap,          label: 'Tool Calls',      value: toolLog.length,                       color: 'text-[#00a651]' },
          { icon: BookOpen,     label: 'RAG Chunks',      value: ragChunks.length,                     color: 'text-[#c07800]' },
          { icon: Activity,     label: 'Tool Latency',    value: `${totalToolLatency}ms`,              color: 'text-[#002244]' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white px-4 py-3 text-center">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#8a95a0]">{label}</div>
          </div>
        ))}
      </div>

      {/* Step timeline */}
      <div className="p-5 border-b border-[#eef0f2]">
        <h4 className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide mb-3">Pipeline Step Timeline</h4>
        <div className="space-y-2">
          {processSteps.filter(s => s.duration > 0).map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${step.status === 'completed' ? 'bg-[#00a651]' : 'bg-[#d8dde2]'}`} />
              <span className="w-52 text-[#3d4a55] font-medium truncate">Step {step.step}: {step.label}</span>
              <div className="flex-1 h-1.5 bg-[#eef0f2] rounded-full overflow-hidden">
                {step.status === 'completed' && <div className="h-full bg-[#009fda] rounded-full" style={{ width: `${Math.min((step.duration / 3000) * 100, 100)}%` }} />}
              </div>
              <span className="w-14 text-right text-[#5c6670]">{step.status === 'completed' ? `${step.duration}ms` : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tool invocation log */}
      <div className="p-5 border-b border-[#eef0f2]">
        <h4 className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide mb-3">Tool Registry Invocation Log ({toolLog.length} calls)</h4>
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {toolLog.map((inv, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-[#f8f9fa] rounded-lg px-3 py-2">
              <span className="text-[10px] font-bold text-[#002244] bg-[#e8f4fc] px-1.5 py-0.5 rounded">S{inv.step}</span>
              <span className="font-medium text-[#002244] w-36 truncate">{inv.tool}</span>
              <span className="text-[#8a95a0] font-mono text-[10px] w-20 truncate">{inv.op}</span>
              <span className={`text-[10px] font-bold flex-shrink-0 ${inv.status === 'success' ? 'text-[#00a651]' : 'text-[#c0392b]'}`}>{inv.status}</span>
              <span className="ml-auto text-[10px] text-[#8a95a0]">{inv.latency_ms}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* RAG query log */}
      <div className="p-5">
        <h4 className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide mb-3">RAG Knowledge Engine Query Log</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {ragChunks.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs bg-[#f8f9fa] rounded-lg px-3 py-2">
              <span className="text-[10px] font-bold text-[#0063a3] bg-[#e8f4fc] px-1.5 py-0.5 rounded flex-shrink-0">{(c.score * 100).toFixed(0)}%</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#002244] truncate">{c.document}</p>
                <p className="text-[10px] text-[#8a95a0]">BM25: {c.bm25.toFixed(2)} · Vector: {c.vector.toFixed(2)} · p.{c.page}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Chat Message ─────────────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-[#002244]' : 'bg-[#009fda]'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-[#002244] text-white rounded-tr-sm' : 'bg-white border border-[#d8dde2] text-[#1a2430] rounded-tl-sm shadow-sm'}`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-[#8a95a0] px-1">{new Date(msg.createdAt).toLocaleTimeString()}</span>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function ChatTerminal() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const agent = state?.agent || AGENTS[0]
  const initialMessage = state?.initialMessage

  const [session, setSession] = useState({ startedAt: Date.now(), status: 'running' })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [processSteps, setProcessSteps] = useState([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [hitlPending, setHitlPending] = useState(false)
  const [hitlDecision, setHitlDecision] = useState(null)
  const [showObservability, setShowObservability] = useState(false)
  const [routingDecision, setRoutingDecision] = useState(null)
  const [escalationPending, setEscalationPending] = useState(false)
  const [pendingTurnText, setPendingTurnText] = useState(null)
  const [showRAG, setShowRAG] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const didInit = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, processSteps, hitlPending, showRAG, showPortfolio])

  useEffect(() => {
    if (!didInit.current && initialMessage) {
      didInit.current = true
      runTurn(initialMessage)
    }
  }, [])

  const addMsg = (role, content) => {
    const msg = { id: crypto.randomUUID(), role, content, createdAt: Date.now() }
    setMessages(prev => [...prev, msg])
    return msg
  }

  const runPipeline = async (steps) => {
    const list = [...steps]
    for (let i = 0; i < list.length; i++) {
      if (list[i].type === 'hitl') break
      list[i] = { ...list[i], status: 'running' }
      setCurrentStepIndex(i)
      setProcessSteps([...list])
      await new Promise(r => setTimeout(r, list[i].duration || 300))
      list[i] = { ...list[i], status: 'completed' }
      setProcessSteps([...list])

      if (list[i].type === 'rag') setShowRAG(true)
      if (list[i].type === 'tool' && i === 2) setShowPortfolio(true)
    }
    return list
  }

  const executeTurn = useCallback(async (text) => {
    setProcessing(true)
    setHitlPending(false)
    setHitlDecision(null)
    setEscalationPending(false)
    setShowRAG(false)
    setShowPortfolio(false)
    setShowObservability(false)

    const steps = buildPipelineSteps()
    setProcessSteps(steps)
    setCurrentStepIndex(0)
    await runPipeline(steps)

    setHitlPending(true)
    setProcessing(false)
  }, [agent])

  const runTurn = useCallback(async (text) => {
    setHitlPending(false)
    setHitlDecision(null)
    setEscalationPending(false)
    setRoutingDecision(null)
    setPendingTurnText(null)
    setProcessSteps([])

    addMsg('user', text)

    const routing = generateRoutingDecision()
    setRoutingDecision(routing)

    if (routing.belowThreshold) {
      setPendingTurnText(text)
      setEscalationPending(true)
      return
    }

    await executeTurn(text)
  }, [agent, executeTurn])

  const handleEscalationProceed = useCallback(async () => {
    setEscalationPending(false)
    if (pendingTurnText) await executeTurn(pendingTurnText)
  }, [pendingTurnText, executeTurn])

  const handleEscalationEscalate = useCallback(() => {
    setEscalationPending(false)
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'system', content: 'Request escalated to a human operator. A specialist will review and respond.', createdAt: Date.now() }])
    setProcessSteps([])
    setRoutingDecision(null)
  }, [])

  const handleSend = () => {
    if (!input.trim() || processing || hitlPending || escalationPending) return
    const text = input.trim()
    setInput('')
    runTurn(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleAccept = (notes) => {
    addMsg('assistant', `ASA record ASA-IND-MTI-2025-0047 promoted to Submitted status.\n\nConceptNote uploaded to SharePoint: https://sharepoint.worldbank.org/sites/india-mti/ASAConceptNotes/India_Climate_Fiscal_Risk_ASA_ConceptNote_Draft_v1.docx\n\nAll 3 alignment flags noted. Practice Manager approval workflow initiated.${notes ? `\n\nReviewer notes: ${notes}` : ''}`)
    setHitlDecision({ decision: 'accepted', notes })
    setHitlPending(false)
    setShowObservability(true)
    setProcessSteps(prev => prev.map(s => s.type === 'hitl' || s.type === 'audit' ? { ...s, status: 'completed' } : s))
    setSession(prev => ({ ...prev, status: 'completed', completedAt: Date.now() }))
  }

  const handleReject = (notes) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'system', content: 'ASA Concept Note rejected by TTL. Record preserved in Draft state. Please revise and resubmit.', createdAt: Date.now() }])
    setHitlDecision({ decision: 'rejected', notes })
    setHitlPending(false)
    setRoutingDecision(null)
    setProcessSteps(prev => prev.map(s => s.type === 'hitl' ? { ...s, status: 'completed' } : s))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full px-4 sm:px-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-[#5c6670] hover:text-[#002244] transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-full bg-[#009fda] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#002244]">{agent.name}</p>
            <p className="text-xs text-[#8a95a0]">{agent.runtime_config?.model} · {agent.data_classification}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${session.status === 'completed' ? 'text-[#00a651]' : processing ? 'text-[#009fda]' : 'text-[#8a95a0]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'completed' ? 'bg-[#00a651]' : processing ? 'bg-[#009fda] animate-pulse' : 'bg-[#8a95a0]'}`} />
            {session.status === 'completed' ? 'Completed' : processing ? 'Processing...' : hitlPending ? 'Awaiting HITL' : 'Idle'}
          </span>
          {session.status === 'completed' && (
            <button onClick={() => setShowObservability(m => !m)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002244] text-white hover:bg-[#003366] transition-colors">
              <Eye className="w-3.5 h-3.5" />{showObservability ? 'Hide' : 'Show'} Observability
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && !processing && (
          <div className="flex justify-center py-12 fade-in">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 rounded-full bg-[#e8f4fc] flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-[#0063a3]" />
              </div>
              <p className="text-sm font-medium text-[#3d4a55] mb-1">{agent.name} is ready</p>
              <p className="text-xs text-[#8a95a0]">Paste your TTL instruction or use the example on the home page</p>
            </div>
          </div>
        )}

        {messages.map(msg =>
          msg.role === 'system' ? (
            <div key={msg.id} className="flex justify-center fade-in">
              <span className="px-3 py-1 bg-[#fff8e6] border border-[#f5a623]/30 text-[#7a4e00] text-xs rounded-full">{msg.content}</span>
            </div>
          ) : (
            <ChatMessage key={msg.id} msg={msg} />
          )
        )}

        {routingDecision && <RoutingDecisionPanel routing={routingDecision} />}

        {escalationPending && <EscalationPanel onProceed={handleEscalationProceed} onEscalate={handleEscalationEscalate} />}

        {processSteps.length > 0 && (
          <ProcessLogPanel steps={processSteps} isRunning={processing} currentStepIndex={currentStepIndex} />
        )}

        {showRAG && <RAGPanel chunks={RAG_RESULTS} />}
        {showPortfolio && <PortfolioPanel items={PORTFOLIO_OVERLAP} />}

        {hitlPending && (
          <HITLPanel
            asaNote={ASA_CONCEPT_NOTE}
            portfolioItems={PORTFOLIO_OVERLAP}
            ragChunks={RAG_RESULTS}
            routingLog={routingDecision}
            toolLog={TOOL_INVOCATIONS}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {hitlDecision && !hitlPending && (
          <div className="flex justify-center fade-in">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${hitlDecision.decision === 'accepted' ? 'bg-[#e6f7ee] text-[#00a651] border border-[#00a651]/20' : 'bg-[#fdf2f1] text-[#c0392b] border border-[#c0392b]/20'}`}>
              {hitlDecision.decision === 'accepted' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              ASA record {hitlDecision.decision === 'accepted' ? 'approved & submitted' : 'rejected by TTL'}
            </span>
          </div>
        )}

        {showObservability && (
          <ObservabilityPanel
            session={session}
            messages={messages}
            processSteps={processSteps}
            toolLog={TOOL_INVOCATIONS}
            ragChunks={RAG_RESULTS}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`flex items-end gap-3 bg-white border rounded-xl shadow-sm p-3 transition-all ${hitlPending || escalationPending ? 'opacity-50 pointer-events-none border-[#d8dde2]' : 'border-[#d8dde2] focus-within:border-[#009fda] focus-within:ring-2 focus-within:ring-[#009fda]/20'}`}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={processing || hitlPending || escalationPending}
          placeholder={escalationPending ? 'Awaiting escalation decision...' : hitlPending ? 'Awaiting HITL review...' : processing ? 'Processing...' : `Message ${agent.name}...`}
          rows={2}
          className="flex-1 bg-transparent resize-none text-sm text-[#1a2430] placeholder-[#8a95a0] outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || processing || hitlPending || escalationPending}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${input.trim() && !processing && !hitlPending && !escalationPending ? 'bg-[#009fda] text-white hover:bg-[#0087bf] shadow-sm' : 'bg-[#d8dde2] text-[#8a95a0] cursor-not-allowed'}`}
        >
          {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-xs text-[#8a95a0] mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
