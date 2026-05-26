import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, MessageSquare, Bot, Wrench, Activity, Shield, Database, FileText, ChevronRight, ArrowRight, Check, TriangleAlert as AlertTriangle, Eye, Link, ChartBar as BarChart2, Terminal, RefreshCw, Users, Zap, Globe } from 'lucide-react'

const SECTIONS = [
  { id: 'overview',      label: 'Platform Overview',     icon: Globe },
  { id: 'home',          label: 'Home / Chat Entry',     icon: MessageSquare },
  { id: 'chat',          label: 'Chat Terminal',         icon: Terminal },
  { id: 'pipeline',      label: '8-Step Pipeline',       icon: ArrowRight },
  { id: 'routing',       label: 'Routing Decision',      icon: Activity },
  { id: 'rag',           label: 'RAG / Knowledge Panel', icon: BookOpen },
  { id: 'portfolio',     label: 'Portfolio Overlap',     icon: Database },
  { id: 'hitl',          label: 'HITL Review Gate',      icon: Shield },
  { id: 'observability', label: 'Observability Dashboard', icon: Eye },
  { id: 'agents',        label: 'Agent Registry',        icon: Bot },
  { id: 'tools',         label: 'Tools Registry',        icon: Wrench },
  { id: 'flow',          label: 'End-to-End Flow',       icon: ArrowRight },
]

function Tag({ color, children }) {
  const colors = {
    blue:   'bg-[#e8f4fc] text-[#0063a3] border-[#d0e8f5]',
    green:  'bg-[#e6f7ee] text-[#00a651] border-[#c0e8d0]',
    amber:  'bg-[#fff8e6] text-[#c07800] border-[#f5e0a0]',
    red:    'bg-[#fdf2f1] text-[#c0392b] border-[#f0c8c4]',
    gray:   'bg-[#f0f4f8] text-[#5c6670] border-[#d8dde2]',
    navy:   'bg-[#e8eef5] text-[#002244] border-[#c8d4e0]',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}

function SectionTitle({ id, icon: Icon, title, subtitle }) {
  return (
    <div id={id} className="flex items-start gap-3 mb-5 pt-2">
      <div className="w-9 h-9 rounded-lg bg-[#002244] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4.5 h-4.5 text-[#009fda]" style={{ width: 18, height: 18 }} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#002244]">{title}</h2>
        {subtitle && <p className="text-sm text-[#5c6670] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function Divider() {
  return <hr className="border-[#eef0f2] my-8" />
}

function StepRow({ num, label, component, type, detail, color }) {
  const colors = {
    routing:   'bg-[#dceef9] text-[#005fa3]',
    rag:       'bg-[#e8f4fc] text-[#0063a3]',
    tool:      'bg-[#e6f7ee] text-[#00a651]',
    synthesis: 'bg-[#d8f0d5] text-[#3d6b3a]',
    hitl:      'bg-[#fff8e6] text-[#c07800]',
    audit:     'bg-[#f0f4f8] text-[#5c6670]',
  }
  return (
    <div className="flex gap-4 py-3 border-b border-[#f0f4f8] last:border-0">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#002244] text-white text-xs font-bold flex items-center justify-center mt-0.5">{num}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-semibold text-[#1a2430]">{label}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[type] || ''}`}>{type}</span>
          <span className="text-xs text-[#8a95a0]">{component}</span>
        </div>
        <p className="text-sm text-[#5c6670] leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

function CalloutBox({ type, children }) {
  const styles = {
    info:    { wrap: 'bg-[#f0f8ff] border-[#009fda]/30 border', icon: <Activity className="w-4 h-4 text-[#009fda] flex-shrink-0 mt-0.5" /> },
    warning: { wrap: 'bg-[#fffbf0] border-[#f5a623]/30 border', icon: <AlertTriangle className="w-4 h-4 text-[#c07800] flex-shrink-0 mt-0.5" /> },
    success: { wrap: 'bg-[#f0f9f4] border-[#00a651]/30 border', icon: <Check className="w-4 h-4 text-[#00a651] flex-shrink-0 mt-0.5" /> },
  }
  const s = styles[type] || styles.info
  return (
    <div className={`rounded-xl px-4 py-3 flex gap-3 my-4 ${s.wrap}`}>
      {s.icon}
      <div className="text-sm text-[#1a2430] leading-relaxed">{children}</div>
    </div>
  )
}

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('overview')
  const navigate = useNavigate()

  const scrollTo = (id) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 gap-8">

      {/* Sidebar TOC */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
        <div className="sticky top-24 bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#002244] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#009fda]" />
            <span className="text-white text-sm font-semibold">Contents</span>
          </div>
          <nav className="p-2">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  activeSection === id ? 'bg-[#e8f4fc] text-[#002244] font-semibold' : 'text-[#5c6670] hover:text-[#002244] hover:bg-[#f0f4f8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 space-y-2">

        {/* Header */}
        <div className="bg-[#002244] rounded-xl px-8 py-7 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#009fda]/20 text-[#40bfe8] text-xs font-semibold mb-4 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#009fda]" />
            OW Agentic AI Framework · PoC Documentation
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">World Bank AI Agent Platform</h1>
          <p className="text-[#8a95a0] text-sm leading-relaxed max-w-2xl">
            Screen-by-screen reference covering every view, component, and interaction flow in the platform. Includes the end-to-end ASA creation PoC walkthrough.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Tag color="blue">Proof of Concept</Tag>
            <Tag color="green">Staging Environment</Tag>
            <Tag color="gray">Official Use Only</Tag>
            <Tag color="navy">v1.2.0</Tag>
          </div>
        </div>

        {/* ── 1. OVERVIEW ─────────────────────────────────────── */}
        <SectionTitle id="overview" icon={Globe} title="Platform Overview" subtitle="What the platform is and how it fits into the OW ecosystem" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          The World Bank AI Agent Platform is a proof-of-concept (PoC) demonstration of the OW Agentic AI Framework. It shows how a Task Team Leader (TTL) can issue a single natural language instruction that triggers a fully autonomous, multi-step, governed agent workflow — covering knowledge retrieval, portfolio analysis, document generation, data entry, file upload, and human review — without manual steps between each.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          {[
            { icon: Bot,      title: 'Agent Registry',  desc: 'Central catalog of approved agents with capability declarations, tool grants, and approval status.' },
            { icon: Wrench,   title: 'Tool Registry',   desc: 'MCP-compliant registry of enterprise connectors — Dataverse, SharePoint, Azure SQL, RAG, SAP.' },
            { icon: Terminal, title: 'Chat Terminal',   desc: 'Execution environment that runs the 8-step pipeline, surfaces live logs, and enforces the HITL gate.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-[#d8dde2] rounded-xl p-4 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#e8f4fc] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[#0063a3]" />
              </div>
              <p className="text-sm font-semibold text-[#002244] mb-1">{title}</p>
              <p className="text-xs text-[#5c6670] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <CalloutBox type="info">
          The PoC is scoped to the <strong>ASA Creation workflow</strong> for the India Climate Fiscal Risk and Public Debt Sustainability Assessment (RAS · MTI · USD 450k · 18 months). All other agents and tools in the registry are available for future PoC phases.
        </CalloutBox>

        <Divider />

        {/* ── 2. HOME ─────────────────────────────────────────── */}
        <SectionTitle id="home" icon={MessageSquare} title="Home / Chat Entry" subtitle="Route: /" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          The home screen is the universal entry point for all agents. It presents a single chat input where users type or paste a natural language instruction. The platform routes the request to the most capable registered agent automatically.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Screen Elements</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { element: 'Platform badge',       desc: 'Identifies the environment (Operations Workspace · Agentic AI Framework PoC).' },
              { element: 'Hero heading',          desc: '"World Bank AI Agent Platform" — establishes context for the TTL.' },
              { element: 'Subtitle',             desc: 'Broad description covering all supported workflows (ASA creation, portfolio analysis, policy briefs, etc.).' },
              { element: 'AI Assistant card',    desc: 'Header shows "World Bank AI Assistant" with Online · Staging status badge.' },
              { element: 'Text input (textarea)',desc: 'Multi-line input for natural language instructions. Enter submits; Shift+Enter adds a new line.' },
              { element: 'Start button',         desc: 'Disabled until input is non-empty. Navigates to /chat with the instruction passed as route state.' },
              { element: 'Agent Registry link',  desc: 'Navigates to /agents to browse registered agents.' },
              { element: 'Tools Registry link',  desc: 'Navigates to /tools to inspect registered connectors.' },
              { element: 'Knowledge Registry link', desc: 'Navigates to /agents (placeholder — will link to dedicated knowledge registry in future phases).' },
            ].map(({ element, desc }) => (
              <div key={element} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-44 flex-shrink-0 mt-0.5">{element}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <CalloutBox type="info">
          The home page is intentionally generic — it does not pre-select an agent or workflow. The <strong>Agent Router</strong> (Step 1 of the pipeline) determines which agent handles the request based on intent classification against the Agent Registry.
        </CalloutBox>

        <Divider />

        {/* ── 3. CHAT TERMINAL ────────────────────────────────── */}
        <SectionTitle id="chat" icon={Terminal} title="Chat Terminal" subtitle="Route: /chat" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          The Chat Terminal is the main execution environment. It receives the user's instruction, runs the full 8-step pipeline visually, and presents each intermediate result (routing decision, RAG chunks, portfolio findings) as collapsible panels before surfacing the HITL review gate. After TTL approval, the session completes and the Observability Dashboard becomes available.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Layout Structure</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { zone: 'Header bar',        desc: 'Back navigation, active agent name + model, session status indicator (Idle / Processing / Awaiting HITL / Completed), and Show Observability toggle (visible after completion).' },
              { zone: 'Chat scroll area',  desc: 'Scrolling feed of all panels rendered in execution order: user message → routing decision → pipeline log → RAG results → portfolio overlap → HITL gate → decision badge → observability dashboard.' },
              { zone: 'Input bar',         desc: 'Disabled during pipeline execution and while HITL gate is open. Re-enabled for follow-up turns after a HITL decision.' },
            ].map(({ zone, desc }) => (
              <div key={zone} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-36 flex-shrink-0 mt-0.5">{zone}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 4. PIPELINE ─────────────────────────────────────── */}
        <SectionTitle id="pipeline" icon={ArrowRight} title="8-Step Execution Pipeline" subtitle="The Execution Pipeline panel — appears during every agent run" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          Every agent run executes a deterministic 8-step pipeline. Each step is shown with its type badge, component label, and a plain-English detail of what is happening. Steps animate through Pending → Running (spinner) → Completed (green check) in real time.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#0063a3]" />
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Execution Pipeline</span>
          </div>
          <div className="px-4 py-1">
            <StepRow num={1} label="Intent Classification & Routing" type="routing" component="Agent Router + Agent Registry" detail="Parses the multi-sentence NL prompt, extracts all intents, scores candidate agents from the Agent Registry against capability declarations, selects the winning agent, and logs the full routing decision record." />
            <StepRow num={2} label="CPF & Knowledge Retrieval" type="rag" component="RAG / Knowledge Engine" detail="Executes 4 targeted hybrid search queries (CPF pillars · RAS governance · prior WBG analytical work · global good practice) against the Azure AI Search index. Applies cross-encoder reranking. Enforces document-level ACL." />
            <StepRow num={3} label="Portfolio Overlap Analysis" type="tool" component="Dataverse Connector + Azure SQL" detail="Queries OW Dataverse for active and pipeline ASAs matching country, GP, and topic code filters. Invokes Azure SQL for financial summaries. Identifies overlap risks and duplication scope." />
            <StepRow num={4} label="Concept Note Generation" type="synthesis" component="RAG + SharePoint Connector" detail="Retrieves the WBG ASA Concept Note template from SharePoint. Composes a structured draft using CPF context, RAS policy references, portfolio gap findings, and inline citations from retrieved chunks." />
            <StepRow num={5} label="Dataverse Record Population" type="tool" component="Dataverse Connector" detail="Creates a new ASA record in the OW Dataverse staging environment. Validates all fields against the ASA entity schema. Returns the ASA record ID for downstream reference." />
            <StepRow num={6} label="SharePoint Upload & Tagging" type="tool" component="SharePoint Connector + Dataverse" detail="Uploads the generated Concept Note to the India MTI SharePoint library with full metadata tags. Writes the SharePoint document URL back to the Dataverse record." />
            <StepRow num={7} label="HITL Review Gate" type="hitl" component="Orchestration Engine" detail="Pauses execution. Surfaces the full review package to the TTL. Non-bypassable — the ASA record stays in Draft until the TTL explicitly approves or rejects." />
            <StepRow num={8} label="Audit & Observability Logging" type="audit" component="Governance Layer" detail="Writes the complete execution trace — routing log, RAG query logs, all 10 tool invocations, and HITL decision — to the observability dashboard. Execution is logged as an auditable event in the Agent Registry." />
          </div>
        </div>

        <CalloutBox type="warning">
          Step 7 (HITL) has no simulated duration — the pipeline pauses and waits for a real TTL decision. Step 8 runs automatically after the TTL approves.
        </CalloutBox>

        <Divider />

        {/* ── 5. ROUTING ──────────────────────────────────────── */}
        <SectionTitle id="routing" icon={Activity} title="Routing Decision Log" subtitle="Appears immediately after the user message, before pipeline execution" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          The Routing Decision panel shows the Agent Router's live output: detected intents, candidate agents with scored progress bars, the selected agent badge, and the full selection rationale.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Panel Elements</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { el: 'Detected Intents',    desc: 'Code-style chips showing every intent extracted from the NL prompt (e.g. initiate_asa, check_cpf_alignment, scan_portfolio_overlap).' },
              { el: 'Candidate Agents',    desc: 'Each registered agent shown with a confidence score bar. The winning agent is highlighted with a SELECTED badge.' },
              { el: 'Intent Match Count',  desc: 'Shows how many of the detected intents each candidate agent supports.' },
              { el: 'Rationale block',     desc: 'Full plain-English explanation of the routing decision including capability score, approval gate result, tool coverage, and environment tier.' },
              { el: 'Low Confidence mode', desc: 'If the top score is below 72%, the panel turns amber and triggers the Escalation Panel instead of starting the pipeline.' },
            ].map(({ el, desc }) => (
              <div key={el} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-40 flex-shrink-0 mt-0.5">{el}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <CalloutBox type="info">
          The confidence threshold is set to <strong>72%</strong>. A score below this triggers the Escalation Panel, giving the TTL the choice to proceed anyway or escalate to a human operator.
        </CalloutBox>

        <Divider />

        {/* ── 6. RAG ──────────────────────────────────────────── */}
        <SectionTitle id="rag" icon={BookOpen} title="RAG / Knowledge Retrieval Panel" subtitle="Appears after Step 2 completes" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          After the Knowledge Engine finishes its 4 hybrid search queries, a collapsible panel shows all retrieved document chunks with full source attribution — exactly the evidence the agent will use when generating the Concept Note.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Per-Chunk Fields</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { field: 'Document title',   desc: 'Full name of the source document (e.g. India CPF FY2018–22 Updated FY2023).' },
              { field: 'Page number',      desc: 'Page within the source document where the chunk was extracted.' },
              { field: 'BM25 score',       desc: 'Keyword relevance score from the BM25 retrieval pass.' },
              { field: 'Vector score',     desc: 'Semantic similarity score from the dense vector retrieval pass.' },
              { field: 'Reranked score',   desc: 'Final score after cross-encoder reranking. Color-coded: green ≥ 90%, amber below.' },
              { field: 'Chunk text',       desc: 'The actual extracted passage that will be cited in the Concept Note.' },
              { field: 'Source URL',       desc: 'SharePoint or Documentum URL for the source document — clickable for traceability.' },
            ].map(({ field, desc }) => (
              <div key={field} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-36 flex-shrink-0 mt-0.5">{field}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <CalloutBox type="success">
          All factual claims in the generated Concept Note are grounded exclusively in retrieved chunks. The RAG panel gives the TTL full visibility into the evidence base before they review the output.
        </CalloutBox>

        <Divider />

        {/* ── 7. PORTFOLIO ────────────────────────────────────── */}
        <SectionTitle id="portfolio" icon={Database} title="Portfolio Overlap Analysis Panel" subtitle="Appears after Step 3 completes" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          After the Dataverse and Azure SQL queries complete, this panel shows every ASA in the OW portfolio that overlaps with the new request — by country, Global Practice, and topic code. It surfaces duplication risks and strategic gaps that feed directly into the Concept Note's rationale section.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Per-ASA Fields</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { field: 'ASA record ID',   desc: 'Dataverse-assigned identifier (e.g. ASA-IND-MTI-2023-0031).' },
              { field: 'Status badge',    desc: 'Active (green), Pipeline (blue), or Closed (gray).' },
              { field: 'Title',           desc: 'Full ASA title as it appears in the Operations Workspace.' },
              { field: 'TTL',             desc: 'Task Team Leader responsible for the overlapping ASA.' },
              { field: 'Budget (USD)',     desc: 'Committed or estimated budget for the overlapping ASA.' },
              { field: 'Overlap type',    desc: 'Agent-generated assessment of the overlap nature — Partial, Complementary, or Historical precedent — with plain-English explanation.' },
            ].map(({ field, desc }) => (
              <div key={field} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-36 flex-shrink-0 mt-0.5">{field}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 8. HITL ─────────────────────────────────────────── */}
        <SectionTitle id="hitl" icon={Shield} title="HITL Review Gate (Step 7)" subtitle="Non-bypassable TTL review before ASA record promotion" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          The HITL (Human-in-the-Loop) gate is the most important screen in the platform. It surfaces everything the TTL needs to review before the ASA record is promoted from <strong>Draft</strong> to <strong>Submitted</strong>. The gate is enforced by the Orchestration Engine and cannot be skipped.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Review Tabs</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { tab: 'Concept Note Draft',   desc: 'Full structured ASA Concept Note in markdown — including development objective, CPF alignment, analytical framework, RAS governance details, proposed outputs, and SharePoint URL. All factual claims carry inline citations.' },
              { tab: 'Portfolio Findings',   desc: 'Summary of the 3 overlapping ASAs from Step 3. Below the list, a red Alignment Flags box surfaces specific risks the TTL must address before submission (additionality narrative, RAS cost recovery, CPF alignment justification).' },
              { tab: 'Routing Log',          desc: 'Tabular summary of the routing decision: selected agent, confidence score, intents matched, approval gate result, tool coverage, environment tier, and fallback agent.' },
              { tab: 'Tool Audit Trail',     desc: 'Every tool invocation from Steps 2–6 — tool name, operation, step number, sanitized input payload, response status, latency, and output reference (record ID or SharePoint URL).' },
            ].map(({ tab, desc }) => (
              <div key={tab} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-44 flex-shrink-0 mt-0.5">{tab}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Actions</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { action: 'Reviewer notes (textarea)', desc: 'Optional free-text notes from the TTL — recorded in the audit log regardless of the decision.' },
              { action: 'Approve & Submit ASA',      desc: 'Promotes the Dataverse record from Draft to Submitted. Triggers a confirmation message in the chat with the SharePoint URL and notes any open alignment flags.' },
              { action: 'Reject & Revise',           desc: 'Keeps the record in Draft. Inserts a system message. Clears the pipeline state so the TTL can refine and resubmit.' },
            ].map(({ action, desc }) => (
              <div key={action} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-44 flex-shrink-0 mt-0.5">{action}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <CalloutBox type="warning">
          The input bar is disabled while the HITL gate is open. The TTL must make an explicit decision before the session can continue.
        </CalloutBox>

        <Divider />

        {/* ── 9. OBSERVABILITY ────────────────────────────────── */}
        <SectionTitle id="observability" icon={Eye} title="Observability Dashboard (Step 8)" subtitle="Accessible via 'Show Observability' after session completion" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          After TTL approval, the full audit and observability record becomes available. This satisfies Step 8 of the PoC — all execution data is logged, traceable, and visible to governance stakeholders.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Dashboard Sections</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { section: 'KPI Row',                   desc: 'Four headline metrics: Total Execution time (seconds), Tool Calls (count), RAG Chunks retrieved, and total Tool Latency (ms).' },
              { section: 'Pipeline Step Timeline',    desc: 'Horizontal bar chart showing each step\'s duration with a proportional fill. Steps with no simulated time (HITL) are excluded.' },
              { section: 'Tool Registry Invocation Log', desc: 'Compact row per tool call: step badge, tool name, operation, status (success/error), and latency. 10 calls total for the ASA PoC.' },
              { section: 'RAG Knowledge Engine Query Log', desc: 'Per-chunk reranking score with BM25 and vector sub-scores, source document title, and page reference.' },
            ].map(({ section, desc }) => (
              <div key={section} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-52 flex-shrink-0 mt-0.5">{section}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 10. AGENT REGISTRY ──────────────────────────────── */}
        <SectionTitle id="agents" icon={Bot} title="Agent Registry" subtitle="Route: /agents" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          The Agent Registry is the authoritative catalog of all registered AI agents. The Agent Router queries it in real time during Step 1 to match detected intents against capability declarations.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Registered Agents (PoC)</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { id: 'agt-ow-001', name: 'ASA Creation Agent',        role: 'Primary PoC agent. Handles the full ASA workflow — CPF alignment, portfolio scan, Concept Note generation, Dataverse write, SharePoint upload.' },
              { id: 'agt-ow-002', name: 'Portfolio Analytics Agent', role: 'Portfolio overlap detection and financial summary retrieval via Dataverse and Azure SQL.' },
              { id: 'agt-ow-003', name: 'Knowledge Retrieval Agent', role: 'Dedicated RAG agent for hybrid search, cross-encoder reranking, and CPF extraction.' },
            ].map(({ id, name, role }) => (
              <div key={id} className="flex gap-4 px-4 py-3">
                <div className="flex-shrink-0">
                  <code className="text-[10px] font-mono text-[#8a95a0]">{id}</code>
                  <p className="text-xs font-semibold text-[#002244] mt-0.5">{name}</p>
                </div>
                <span className="text-xs text-[#5c6670] leading-relaxed mt-0.5">{role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Agent Detail View — Tabs</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { tab: 'Overview',       desc: 'Agent description, owner, version, data classification, allowed user roles, skills list, and supported intents.' },
              { tab: 'Capabilities',   desc: 'Input and output JSON schemas with field types, descriptions, and required markers.' },
              { tab: 'Runtime',        desc: 'Model ID, temperature, max tokens, top-p, frequency penalty, memory settings (type, window size, embeddings), and timeout.' },
              { tab: 'Tools',          desc: 'List of tool IDs the agent is granted access to, linked to the Tool Registry entries.' },
              { tab: 'Audit Log',      desc: 'Full chronological log of all registry events (created, updated, approved) with actor, timestamp, and delta.' },
            ].map(({ tab, desc }) => (
              <div key={tab} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-28 flex-shrink-0 mt-0.5">{tab}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 11. TOOLS REGISTRY ──────────────────────────────── */}
        <SectionTitle id="tools" icon={Wrench} title="Tools Registry" subtitle="Route: /tools" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-4">
          The Tools Registry is the MCP-compliant catalog of all enterprise connectors. It defines the allowed inputs/outputs, authentication requirements, rate limits, and usage policies for each tool. All agent-to-tool calls are mediated through the Tool Registry execution proxy — there are no direct connector calls from agent code.
        </p>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Registered Tools (PoC)</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { id: 'tool-ow-001', name: 'Knowledge Engine API',  aff: 'Azure AI Search',  desc: 'Hybrid BM25 + vector search with cross-encoder reranking over CPF docs, ESW reports, policy notes, and global literature.' },
              { id: 'tool-ow-002', name: 'Dataverse Connector',   aff: 'Dataverse',        desc: 'Read/write to OW ASA records, project entities, and CPF mappings. Schema validation before every write.' },
              { id: 'tool-ow-003', name: 'SharePoint Connector',  aff: 'SharePoint',       desc: 'Document upload, template retrieval, and metadata tagging for OW Global Practice libraries.' },
              { id: 'tool-ow-004', name: 'Azure SQL Connector',   aff: 'Azure SQL',        desc: 'Read-only financial summary data — committed budgets, disbursements, and pipeline overview.' },
              { id: 'tool-ow-005', name: 'SAP Connector',         aff: 'SAP FMS',          desc: 'Registered and discoverable. Not exercised in the current PoC. Required for future financial management integration.' },
            ].map(({ id, name, aff, desc }) => (
              <div key={id} className="flex gap-4 px-4 py-3">
                <div className="w-44 flex-shrink-0">
                  <code className="text-[10px] font-mono text-[#8a95a0]">{id}</code>
                  <p className="text-xs font-semibold text-[#002244] mt-0.5">{name}</p>
                  <Tag color="gray">{aff}</Tag>
                </div>
                <span className="text-xs text-[#5c6670] leading-relaxed mt-0.5">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#d8dde2] rounded-xl overflow-hidden shadow-sm mb-4">
          <div className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#eef0f2]">
            <span className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide">Tool Detail View — Tabs</span>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            {[
              { tab: 'Overview',     desc: 'Tool description, maintainer, version, system affiliation, and category tags.' },
              { tab: 'Schema',       desc: 'Input and output JSON schemas — required fields, property types, enums, defaults.' },
              { tab: 'Auth & Limits', desc: 'Authentication type (none / bearer / oauth2), token environment variable, rate limits (RPM, daily quota, burst), and throttle policy.' },
              { tab: 'Usage Policy', desc: 'Formal usage policies governing how agents may invoke the tool — attribution, caching limits, PII handling, circuit breaker rules.' },
            ].map(({ tab, desc }) => (
              <div key={tab} className="flex gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-[#002244] w-28 flex-shrink-0 mt-0.5">{tab}</span>
                <span className="text-xs text-[#5c6670] leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── 12. END-TO-END FLOW ─────────────────────────────── */}
        <SectionTitle id="flow" icon={ArrowRight} title="End-to-End PoC Flow" subtitle="India Climate Fiscal Risk ASA — walkthrough" />

        <p className="text-sm text-[#3d4a55] leading-relaxed mb-5">
          Below is the complete sequence of events when the TTL runs the PoC prompt end-to-end.
        </p>

        <div className="space-y-3">
          {[
            { n: '01', title: 'TTL enters instruction on Home page', detail: 'Pastes the India Climate Fiscal Risk ASA instruction (or clicks Load PoC example). Clicks Start.' },
            { n: '02', title: 'Navigated to Chat Terminal (/chat)', detail: 'The instruction is passed as route state. The chat session starts immediately.' },
            { n: '03', title: 'User message rendered', detail: 'Instruction appears as a user bubble in the chat feed.' },
            { n: '04', title: 'Routing Decision Log shown', detail: 'Agent Router extracts 6 intents, scores 3 candidate agents, selects ASA Creation Agent (91%). Panel appears in feed.' },
            { n: '05', title: 'Pipeline starts — Steps 1–6', detail: 'Each step animates through Pending → Running → Completed. Step details update in real time in the Execution Pipeline panel.' },
            { n: '06', title: 'RAG panel appears after Step 2', detail: '4 document chunks shown with scores, source text, and SharePoint/Documentum URLs.' },
            { n: '07', title: 'Portfolio panel appears after Step 3', detail: '3 overlapping ASAs shown with overlap type assessment and alignment flags.' },
            { n: '08', title: 'HITL gate opens after Step 6', detail: 'Pipeline pauses. Input bar disabled. TTL reviews 4 tabs: Concept Note, Portfolio Findings, Routing Log, Tool Audit Trail.' },
            { n: '09', title: 'TTL approves', detail: 'Clicks "Approve & Submit ASA". ASA record promoted to Submitted. Confirmation message with SharePoint URL added to chat.' },
            { n: '10', title: 'Session completes', detail: 'Status badge shows Completed. "Show Observability" button appears in header.' },
            { n: '11', title: 'TTL opens Observability Dashboard', detail: 'Step 8 panel shows KPIs, pipeline timeline, 10-call tool invocation log, and RAG query log. Full audit trace visible.' },
          ].map(({ n, title, detail }) => (
            <div key={n} className="flex gap-4 bg-white border border-[#d8dde2] rounded-xl px-4 py-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#002244] text-[#009fda] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</div>
              <div>
                <p className="text-sm font-semibold text-[#1a2430] mb-0.5">{title}</p>
                <p className="text-xs text-[#5c6670] leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <CalloutBox type="success">
          <strong>Success Criteria (from TOR):</strong> A new ASA record is created in OW Dataverse staging with all required fields validated. A formatted Concept Note draft is uploaded to SharePoint with correct metadata. SharePoint URL is linked back to the Dataverse record. Portfolio overlap analysis is surfaced with at least one India MTI comparison data point. All steps are visible in the observability dashboard.
        </CalloutBox>

        {/* Footer */}
        <div className="mt-10 bg-[#f8f9fa] border border-[#d8dde2] rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <p className="text-sm font-semibold text-[#002244]">OW Agentic AI Framework TOR — PoC Documentation</p>
            <p className="text-xs text-[#8a95a0] mt-0.5">Internal · Official Use Only · Staging Environment</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/agents')} className="flex items-center gap-1.5 px-4 py-2 bg-[#002244] text-white text-xs font-semibold rounded-lg hover:bg-[#003366] transition-colors">
              <Bot className="w-3.5 h-3.5" /> Agent Registry
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-4 py-2 bg-[#009fda] text-white text-xs font-semibold rounded-lg hover:bg-[#0087bf] transition-colors">
              <MessageSquare className="w-3.5 h-3.5" /> Run PoC
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
