import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AGENTS } from '../lib/agents'
import {
  Send, Bot, User, Users, ChevronDown, ChevronRight,
  CircleCheck as CheckCircle, Clock, Zap, MessageSquare,
  TriangleAlert as AlertTriangle, ArrowLeft, Terminal,
  Activity, Check, X, ChartBar as BarChart2, Timer, RefreshCw,
} from 'lucide-react'

const PIPELINE_TEMPLATES = [
  { step: 'Input Validation',   duration: 300,  type: 'system'    },
  { step: 'Agent Routing',      duration: 500,  type: 'routing'   },
  { step: 'Context Retrieval',  duration: 800,  type: 'retrieval' },
  { step: 'Tool Planning',      duration: 600,  type: 'planning'  },
  { step: 'Tool Execution',     duration: 1400, type: 'tool'      },
  { step: 'Response Synthesis', duration: 900,  type: 'synthesis' },
  { step: 'Safety Check',       duration: 400,  type: 'safety'    },
]

const CONFIDENCE_THRESHOLD = 0.72

const STEP_TYPE_COLORS = {
  system:    'text-[#8a95a0] bg-[#f0f4f8]',
  routing:   'text-[#005fa3] bg-[#dceef9]',
  retrieval: 'text-[#0063a3] bg-[#e8f4fc]',
  planning:  'text-[#c07800] bg-[#fff8e6]',
  tool:      'text-[#00a651] bg-[#e6f7ee]',
  synthesis: 'text-[#3d6b3a] bg-[#d8f0d5]',
  safety:    'text-[#c0392b] bg-[#fdf2f1]',
}

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a
}

function generateRoutingDecision(agentName) {
  const score = parseFloat((0.60 + Math.random() * 0.38).toFixed(2))
  const candidates = [
    { name: agentName,             score,                                  selected: true  },
    { name: 'Policy Research Agent', score: parseFloat((score - 0.12 - Math.random() * 0.1).toFixed(2)), selected: false },
    { name: 'Data Analyst Agent',    score: parseFloat((score - 0.22 - Math.random() * 0.1).toFixed(2)), selected: false },
  ].filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
   .sort((a, b) => b.score - a.score)

  const rationale = score >= CONFIDENCE_THRESHOLD
    ? `Selected "${agentName}" (score ${score}) — highest capability match for detected intent. Routing confidence above threshold (${CONFIDENCE_THRESHOLD}).`
    : `Low confidence routing (score ${score} < threshold ${CONFIDENCE_THRESHOLD}). Escalation recommended — intent ambiguous across multiple agents.`

  return { candidates, selectedScore: score, rationale, belowThreshold: score < CONFIDENCE_THRESHOLD }
}

function buildSteps(agentName) {
  const details = {
    system:    'Parsing user input, checking permissions, validating session context.',
    routing:   `Classifying intent and scoring candidate agents from Agent Registry.`,
    retrieval: `Retrieving relevant context from knowledge base for ${agentName}.`,
    planning:  'Analyzing query intent. Selecting optimal tools from available registry.',
    tool:      'Calling external APIs and processing data sources.',
    synthesis: 'Aggregating tool outputs. Composing structured response.',
    safety:    'Running content policy checks. Validating output for compliance.',
  }
  return PIPELINE_TEMPLATES.map((t, i) => ({
    id: i,
    step: t.step,
    duration: randomBetween(t.duration - 100, t.duration + 300),
    type: t.type,
    status: 'pending',
    detail: details[t.type] || 'Processing...',
  }))
}

function pickResponse(agentName) {
  const pool = [
    `Based on my analysis of the available World Bank data, here is a comprehensive summary:\n\n**Key Findings:**\n- GDP growth across the region has shown a 3.2% average increase over the last 5 years\n- Infrastructure investment correlates strongly with productivity gains (r=0.78)\n- The poverty headcount ratio has decreased by 12 percentage points since 2015\n\n**Recommendations:**\n1. Prioritize digital infrastructure in rural areas\n2. Expand social protection programs targeting vulnerable households\n3. Strengthen fiscal frameworks to sustain growth momentum\n\nThis analysis draws from World Bank Development Indicators (WDI) and the latest World Development Report.`,
    `I have processed your request using ${agentName}'s specialized capabilities.\n\n**Analysis Complete:**\nThe query has been evaluated against 847 relevant policy documents and 12 data sources. The findings indicate significant opportunities for intervention in the identified sectors.\n\n**Data Sources Used:**\n- World Bank Open Data API (143 indicators)\n- Regional Economic Outlook (IMF, 2024)\n- Poverty and Equity Database\n\n**Confidence Score:** 94.2%\n\nWould you like me to drill deeper into any specific aspect of this analysis?`,
    `Processing complete. Here is my structured response to your query:\n\n**Executive Summary:**\nThe requested analysis reveals three critical dimensions that require attention from operational teams. Cross-referencing with historical World Bank project data shows consistent patterns that inform the recommendations below.\n\n**Supporting Evidence:**\n- 15 comparable country cases reviewed\n- Fiscal multiplier estimated at 1.4x for proposed interventions\n- Timeline for impact: 18-24 months for measurable outcomes\n\n**Next Steps:**\nPlease review the attached findings and confirm if you would like to proceed with the proposed framework.`,
  ]
  return pool[randomBetween(0, pool.length - 1)]
}

// ---- Process Log Panel ----
function ProcessLogPanel({ steps, isRunning }) {
  const [open, setOpen] = useState(true)
  const completedCount = steps.filter(s => s.status === 'completed').length
  const runningStep = steps.find(s => s.status === 'running')

  return (
    <div className="border border-[#d8dde2] rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-[#eef0f2] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0063a3]" />
          <span className="text-sm font-semibold text-[#002244]">Background Process</span>
          {isRunning && runningStep && (
            <span className="flex items-center gap-1.5 text-xs text-[#009fda] ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009fda] animate-pulse" />
              {runningStep.step}...
            </span>
          )}
          {!isRunning && steps.length > 0 && (
            <span className="text-xs text-[#00a651] ml-2 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {completedCount}/{steps.length} completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex gap-0.5">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          )}
          {open
            ? <ChevronDown className="w-4 h-4 text-[#8a95a0]" />
            : <ChevronRight className="w-4 h-4 text-[#8a95a0]" />}
        </div>
      </button>

      {open && (
        <div className="divide-y divide-[#eef0f2]">
          {steps.map(step => (
            <div key={step.id} className={`flex items-start gap-3 px-4 py-3 transition-all ${step.status === 'running' ? 'bg-[#f0f8ff]' : ''}`}>
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-[#00a651]" />}
                {step.status === 'running'   && <RefreshCw   className="w-4 h-4 text-[#009fda] animate-spin" />}
                {step.status === 'pending'   && <div className="w-4 h-4 rounded-full border-2 border-[#d8dde2]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${STEP_TYPE_COLORS[step.type] || ''}`}>
                    {step.type}
                  </span>
                  <span className="text-sm font-medium text-[#1a2430]">{step.step}</span>
                  {step.status === 'completed' && (
                    <span className="text-xs text-[#8a95a0] ml-auto">{step.duration}ms</span>
                  )}
                </div>
                <p className="text-xs text-[#5c6670]">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Routing Decision Panel ----
function RoutingDecisionPanel({ routing }) {
  const [open, setOpen] = useState(true)
  const { candidates, rationale, belowThreshold } = routing

  return (
    <div className={`border rounded-xl overflow-hidden bg-white shadow-sm fade-in ${belowThreshold ? 'border-[#f5a623]' : 'border-[#d8dde2]'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${belowThreshold ? 'bg-[#fffbf0] hover:bg-[#fff3d0]' : 'bg-[#f8f9fa] hover:bg-[#eef0f2]'}`}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0063a3]" />
          <span className="text-sm font-semibold text-[#002244]">Routing Decision</span>
          {belowThreshold && (
            <span className="flex items-center gap-1 text-xs text-[#c07800] ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]" />
              Low Confidence
            </span>
          )}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-[#8a95a0]" /> : <ChevronRight className="w-4 h-4 text-[#8a95a0]" />}
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            {candidates.map((c, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${c.selected ? 'border-[#009fda] bg-[#f0f8ff]' : 'border-[#eef0f2] bg-[#fafbfc]'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold truncate ${c.selected ? 'text-[#002244]' : 'text-[#5c6670]'}`}>{c.name}</span>
                    {c.selected && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#009fda] text-white">SELECTED</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#eef0f2] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${c.selected ? 'bg-[#009fda]' : 'bg-[#b0b8c1]'}`}
                        style={{ width: `${Math.round(c.score * 100)}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-bold w-10 text-right ${c.score >= CONFIDENCE_THRESHOLD ? 'text-[#00a651]' : 'text-[#c0392b]'}`}>
                      {Math.round(c.score * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${belowThreshold ? 'bg-[#fff8e6] text-[#7a4e00] border border-[#f5a623]/30' : 'bg-[#f0f8ff] text-[#1a3a5c] border border-[#009fda]/20'}`}>
            <span className="font-semibold">Rationale: </span>{rationale}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Escalation Panel ----
function EscalationPanel({ routing, onEscalate, onProceed }) {
  return (
    <div className="border-2 border-[#f5a623] rounded-xl bg-[#fffbf0] shadow-sm fade-in overflow-hidden">
      <div className="px-4 py-3 bg-[#f5a623]/10 border-b border-[#f5a623]/30 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#c07800]" />
        <span className="text-sm font-semibold text-[#7a4e00]">Low Confidence — Human Escalation Required</span>
        <span className="ml-auto text-xs text-[#a06800]">Score &lt; {Math.round(CONFIDENCE_THRESHOLD * 100)}%</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#5c6670] mb-4">
          The router could not confidently match this request to an agent (confidence score below {Math.round(CONFIDENCE_THRESHOLD * 100)}%). Please choose how to proceed:
        </p>
        <div className="flex gap-3">
          <button
            onClick={onProceed}
            className="flex items-center gap-2 px-4 py-2 bg-[#009fda] text-white text-sm font-semibold rounded-lg hover:bg-[#0087bf] transition-colors flex-1 justify-center"
          >
            <Check className="w-4 h-4" /> Proceed Anyway
          </button>
          <button
            onClick={onEscalate}
            className="flex items-center gap-2 px-4 py-2 bg-[#002244] text-white text-sm font-semibold rounded-lg hover:bg-[#003366] transition-colors flex-1 justify-center"
          >
            <Users className="w-4 h-4" /> Escalate to Operator
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- HITL Panel ----
function HITLPanel({ message, onAccept, onReject }) {
  const [notes, setNotes] = useState('')
  const [deciding, setDeciding] = useState(false)

  return (
    <div className="border-2 border-[#f5a623] rounded-xl bg-[#fffbf0] shadow-sm fade-in overflow-hidden">
      <div className="px-4 py-3 bg-[#f5a623]/10 border-b border-[#f5a623]/30 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#c07800]" />
        <span className="text-sm font-semibold text-[#7a4e00]">Human Review Required</span>
        <span className="ml-auto text-xs text-[#a06800]">HITL Checkpoint</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#5c6670] mb-3">
          The agent has produced a response that requires your review before it is accepted as final.
        </p>
        <div className="bg-white border border-[#e8d99a] rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
          <p className="text-sm text-[#1a2430] whitespace-pre-wrap leading-relaxed">{message}</p>
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Optional reviewer notes..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-[#e8d99a] bg-white text-sm resize-none focus:outline-none focus:border-[#f5a623] focus:ring-2 focus:ring-[#f5a623]/20 transition-all mb-3"
        />
        <div className="flex gap-3">
          <button
            onClick={() => { setDeciding(true); onAccept(notes) }}
            disabled={deciding}
            className="flex items-center gap-2 px-5 py-2 bg-[#00a651] text-white text-sm font-semibold rounded-lg hover:bg-[#008843] transition-colors disabled:opacity-60 flex-1 justify-center"
          >
            <Check className="w-4 h-4" /> Accept Response
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

// ---- Metrics Panel ----
function MetricsPanel({ session, messages, processSteps }) {
  const totalMs = session.completedAt - session.startedAt
  const donesteps = processSteps.filter(s => s.status === 'completed')
  const avgStepMs = donesteps.length ? Math.round(donesteps.reduce((a, s) => a + s.duration, 0) / donesteps.length) : 0
  const userMessages = messages.filter(m => m.role === 'user')

  return (
    <div className="bg-white border border-[#d8dde2] rounded-xl shadow-sm overflow-hidden fade-in">
      <div className="px-5 py-4 border-b border-[#eef0f2] bg-[#002244] flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-[#009fda]" />
        <h3 className="font-semibold text-white text-sm">Session Metrics & Logs</h3>
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-[#00a651]/20 text-[#4cc180]">
          completed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#eef0f2]">
        {[
          { icon: Timer,       label: 'Total Time', value: `${(totalMs / 1000).toFixed(1)}s`,   color: 'text-[#0063a3]' },
          { icon: MessageSquare, label: 'Turns',    value: userMessages.length,                  color: 'text-[#002244]' },
          { icon: Zap,         label: 'Avg Step',   value: avgStepMs ? `${avgStepMs}ms` : '—',  color: 'text-[#c07800]' },
          { icon: Activity,    label: 'Steps Run',  value: donesteps.length,                     color: 'text-[#00a651]' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white px-4 py-3 text-center">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#8a95a0]">{label}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="p-5 border-b border-[#eef0f2]">
        <h4 className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide mb-3">Process Timeline</h4>
        <div className="space-y-2">
          {processSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${step.status === 'completed' ? 'bg-[#00a651]' : 'bg-[#d8dde2]'}`} />
              <span className="w-36 text-[#3d4a55] font-medium">{step.step}</span>
              <div className="flex-1 h-1.5 bg-[#eef0f2] rounded-full overflow-hidden">
                {step.status === 'completed' && (
                  <div className="h-full bg-[#009fda] rounded-full" style={{ width: `${Math.min((step.duration / 2000) * 100, 100)}%` }} />
                )}
              </div>
              <span className={`w-14 text-right ${step.status === 'completed' ? 'text-[#5c6670]' : 'text-[#d8dde2]'}`}>
                {step.status === 'completed' ? `${step.duration}ms` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Message log */}
      <div className="p-5">
        <h4 className="text-xs font-semibold text-[#3d4a55] uppercase tracking-wide mb-3">Message Log</h4>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-[#8a95a0] w-20 flex-shrink-0 font-mono">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
              <span className={`px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${
                msg.role === 'user'      ? 'bg-[#e8f4fc] text-[#0063a3]' :
                msg.role === 'assistant' ? 'bg-[#e6f7ee] text-[#00a651]' :
                                           'bg-[#f0f4f8] text-[#5c6670]'
              }`}>
                {msg.role}
              </span>
              <span className="text-[#3d4a55] truncate">
                {msg.content.slice(0, 80)}{msg.content.length > 80 ? '...' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Chat Message ----
function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-[#002244]' : 'bg-[#009fda]'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#002244] text-white rounded-tr-sm'
            : 'bg-white border border-[#d8dde2] text-[#1a2430] rounded-tl-sm shadow-sm'
        }`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-[#8a95a0] px-1">
          {new Date(msg.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

// ---- Main ----
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
  const [hitlPending, setHitlPending] = useState(null)
  const [hitlDecision, setHitlDecision] = useState(null)
  const [showMetrics, setShowMetrics] = useState(false)
  const [routingDecision, setRoutingDecision] = useState(null)
  const [escalationPending, setEscalationPending] = useState(false)
  const [pendingTurnText, setPendingTurnText] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const didInit = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, processSteps, hitlPending])

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
      list[i] = { ...list[i], status: 'running' }
      setProcessSteps([...list])
      await new Promise(r => setTimeout(r, list[i].duration))
      list[i] = { ...list[i], status: 'completed' }
      setProcessSteps([...list])
    }
    return list
  }

  const executeTurn = useCallback(async (text) => {
    setProcessing(true)
    setHitlPending(null)
    setHitlDecision(null)
    setEscalationPending(false)

    const steps = buildSteps(agent.name)
    setProcessSteps(steps)
    await runPipeline(steps)

    const responseText = pickResponse(agent.name)
    setHitlPending({ content: responseText, id: crypto.randomUUID() })
    setProcessing(false)
  }, [agent])

  const runTurn = useCallback(async (text) => {
    setHitlPending(null)
    setHitlDecision(null)
    setEscalationPending(false)
    setRoutingDecision(null)
    setPendingTurnText(null)

    addMsg('user', text)

    const routing = generateRoutingDecision(agent.name)
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
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(), role: 'system',
      content: 'Request escalated to a human operator. A specialist will review and respond.',
      createdAt: Date.now(),
    }])
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
    addMsg('assistant', hitlPending.content)
    setHitlDecision({ decision: 'accepted', notes })
    setHitlPending(null)
    setShowMetrics(true)
    setSession(prev => ({ ...prev, status: 'completed', completedAt: Date.now() }))
  }

  const handleReject = (notes) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(), role: 'system',
      content: 'Response rejected. Please refine your query and try again.',
      createdAt: Date.now(),
    }])
    setHitlDecision({ decision: 'rejected', notes })
    setHitlPending(null)
    setProcessSteps([])
    setRoutingDecision(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full px-4 sm:px-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-[#5c6670] hover:text-[#002244] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-full bg-[#009fda] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#002244]">{agent.name}</p>
            <p className="text-xs text-[#8a95a0]">{agent.runtime_config?.model || agent.model}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${
            session.status === 'completed' ? 'text-[#00a651]' :
            processing ? 'text-[#009fda]' : 'text-[#8a95a0]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              session.status === 'completed' ? 'bg-[#00a651]' :
              processing ? 'bg-[#009fda] animate-pulse' : 'bg-[#8a95a0]'
            }`} />
            {session.status === 'completed' ? 'Completed' : processing ? 'Processing...' : 'Idle'}
          </span>
          {session.status === 'completed' && (
            <button
              onClick={() => setShowMetrics(m => !m)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#002244] text-white hover:bg-[#003366] transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {showMetrics ? 'Hide' : 'Show'} Metrics
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
              <p className="text-xs text-[#8a95a0]">Type a message below to begin</p>
            </div>
          </div>
        )}

        {messages.map(msg =>
          msg.role === 'system' ? (
            <div key={msg.id} className="flex justify-center fade-in">
              <span className="px-3 py-1 bg-[#fff8e6] border border-[#f5a623]/30 text-[#7a4e00] text-xs rounded-full">
                {msg.content}
              </span>
            </div>
          ) : (
            <ChatMessage key={msg.id} msg={msg} />
          )
        )}

        {routingDecision && (
          <RoutingDecisionPanel routing={routingDecision} />
        )}

        {escalationPending && (
          <EscalationPanel
            routing={routingDecision}
            onProceed={handleEscalationProceed}
            onEscalate={handleEscalationEscalate}
          />
        )}

        {processSteps.length > 0 && (
          <ProcessLogPanel steps={processSteps} isRunning={processing} />
        )}

        {hitlPending && (
          <HITLPanel message={hitlPending.content} onAccept={handleAccept} onReject={handleReject} />
        )}

        {hitlDecision && !hitlPending && (
          <div className="flex justify-center fade-in">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              hitlDecision.decision === 'accepted'
                ? 'bg-[#e6f7ee] text-[#00a651] border border-[#00a651]/20'
                : 'bg-[#fdf2f1] text-[#c0392b] border border-[#c0392b]/20'
            }`}>
              {hitlDecision.decision === 'accepted' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              Response {hitlDecision.decision} by reviewer
            </span>
          </div>
        )}

        {showMetrics && (
          <MetricsPanel session={session} messages={messages} processSteps={processSteps} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`flex items-end gap-3 bg-white border rounded-xl shadow-sm p-3 transition-all ${
        hitlPending || escalationPending
          ? 'opacity-50 pointer-events-none border-[#d8dde2]'
          : 'border-[#d8dde2] focus-within:border-[#009fda] focus-within:ring-2 focus-within:ring-[#009fda]/20'
      }`}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={processing || !!hitlPending || escalationPending}
          placeholder={
            escalationPending ? 'Awaiting escalation decision...' :
            hitlPending       ? 'Waiting for human review...' :
            processing        ? 'Processing...' :
            `Message ${agent.name}...`
          }
          rows={2}
          className="flex-1 bg-transparent resize-none text-sm text-[#1a2430] placeholder-[#8a95a0] outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || processing || !!hitlPending || escalationPending}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            input.trim() && !processing && !hitlPending && !escalationPending
              ? 'bg-[#009fda] text-white hover:bg-[#0087bf] shadow-sm'
              : 'bg-[#d8dde2] text-[#8a95a0] cursor-not-allowed'
          }`}
        >
          {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-xs text-[#8a95a0] mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
