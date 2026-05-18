import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Bot, ChevronRight, FileText, Database, BookOpen, ArrowRight } from 'lucide-react'

const POC_PROMPT = `I need to initiate a new ASA for India focused on assessing fiscal risks from climate change and their implications for public debt sustainability. This is a reimbursable advisory activity requested by the Ministry of Finance, Government of India, with an estimated budget of USD 450,000 and a planned delivery timeline of 18 months. The primary outputs should be a flagship policy note and two technical background papers. Please align this to the India CPF, check for any overlapping ASAs in the current portfolio, retrieve relevant prior WBG analytical work and global good practice on climate fiscal risk, draft the ASA Concept Note with a proposed development objective and analytical framework, populate the ASA record in the Operations Workspace, and upload the draft concept note to SharePoint. Tag this under the Macroeconomics, Trade, and Investment (MTI) Global Practice, with topic codes for Climate Change (CC) and Fiscal Policy (FP). Flag any alignment gaps or risks for my review before submission.`

const WORKFLOW_STEPS = [
  { step: 1, label: 'Intent Classification & Routing', component: 'Agent Router + Registry',     color: 'text-[#0063a3] bg-[#e8f4fc]' },
  { step: 2, label: 'CPF & Knowledge Retrieval',       component: 'RAG / Knowledge Engine',      color: 'text-[#00a651] bg-[#e6f7ee]' },
  { step: 3, label: 'Portfolio Overlap Analysis',      component: 'Dataverse + Azure SQL',        color: 'text-[#c07800] bg-[#fff8e6]' },
  { step: 4, label: 'Concept Note Generation',         component: 'RAG + SharePoint template',    color: 'text-[#0063a3] bg-[#e8f4fc]' },
  { step: 5, label: 'Dataverse Record Population',     component: 'Enterprise Connectors',        color: 'text-[#00a651] bg-[#e6f7ee]' },
  { step: 6, label: 'SharePoint Upload & Tagging',     component: 'Enterprise Connectors',        color: 'text-[#c07800] bg-[#fff8e6]' },
  { step: 7, label: 'HITL Review Gate',                component: 'Orchestration Engine',         color: 'text-[#c0392b] bg-[#fdf2f1]' },
  { step: 8, label: 'Audit & Observability',           component: 'Governance Layer',             color: 'text-[#5c6670] bg-[#f0f4f8]' },
]

export default function Home() {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const handleStart = () => {
    if (!input.trim()) return
    navigate('/chat', { state: { initialMessage: input.trim() } })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleStart()
    }
  }

  const loadExample = () => {
    setInput(POC_PROMPT)
    inputRef.current?.focus()
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
      {/* Hero */}
      <div className="text-center mb-8 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f4fc] text-[#0063a3] text-xs font-semibold mb-4 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#009fda]" />
          Operations Workspace · Agentic AI Framework PoC
        </div>
        <h1 className="text-3xl font-bold text-[#002244] leading-tight mb-3">
          World Bank AI Agent Platform
        </h1>
        <p className="text-[#5c6670] text-base leading-relaxed max-w-2xl mx-auto">
          Autonomous multi-step agent workflows for OW operations — ASA creation, CPF alignment, portfolio analysis, and document generation, governed end-to-end through the Agent Registry, Tool Registry, and HITL review gate.
        </p>
      </div>

      {/* 8-step workflow strip */}
      <div className="w-full max-w-5xl mb-8 overflow-x-auto">
        <div className="flex gap-1 min-w-max mx-auto justify-center pb-1">
          {WORKFLOW_STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1 w-[88px]">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>Step {s.step}</span>
                <span className="text-[10px] text-[#3d4a55] font-semibold text-center leading-tight">{s.label}</span>
                <span className="text-[9px] text-[#8a95a0] text-center leading-tight">{s.component}</span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[#b0b8c1] flex-shrink-0 mb-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Card */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-[#d8dde2] overflow-hidden mb-4">
        <div className="bg-[#002244] px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#009fda] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">ASA Creation Agent</p>
            <p className="text-[#8a95a0] text-xs">Enter your TTL instruction or load the PoC example</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#4cc180]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a651] animate-pulse" />
            Online · Staging
          </span>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-end gap-3 bg-[#f8f9fa] rounded-xl border border-[#d8dde2] focus-within:border-[#009fda] focus-within:ring-2 focus-within:ring-[#009fda]/20 transition-all p-3 mb-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Paste your TTL instruction — e.g. "I need to initiate a new ASA for India focused on..."`}
              rows={4}
              className="flex-1 bg-transparent resize-none text-sm text-[#1a2430] placeholder-[#8a95a0] outline-none leading-relaxed"
            />
            <button
              onClick={handleStart}
              disabled={!input.trim()}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                input.trim()
                  ? 'bg-[#009fda] text-white hover:bg-[#0087bf] shadow-sm'
                  : 'bg-[#d8dde2] text-[#8a95a0] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Run</span>
            </button>
          </div>

          <button
            onClick={loadExample}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#009fda]/40 bg-[#f0f8ff] text-[#0063a3] text-xs font-medium hover:bg-[#e0f0fc] hover:border-[#009fda] transition-all text-left"
          >
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-semibold mr-1">Load PoC example:</span>
            India Climate Fiscal Risk &amp; Public Debt Sustainability ASA (RAS · MTI · USD 450k · 18 months)
            <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
          </button>

          <p className="text-xs text-[#8a95a0] mt-2 text-center">Enter to run · Shift+Enter for new line</p>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="mt-2 flex gap-6 flex-wrap justify-center">
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 text-sm text-[#0063a3] hover:text-[#002244] font-medium transition-colors"
        >
          <Bot className="w-4 h-4" />
          Agent Registry
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-sm text-[#0063a3] hover:text-[#002244] font-medium transition-colors"
        >
          <Database className="w-4 h-4" />
          Tools Registry
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 text-sm text-[#0063a3] hover:text-[#002244] font-medium transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Registry
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
