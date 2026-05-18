import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Bot, ChevronRight, Database, BookOpen } from 'lucide-react'

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

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-14 px-4">
      {/* Hero */}
      <div className="text-center mb-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f4fc] text-[#0063a3] text-xs font-semibold mb-5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#009fda]" />
          Operations Workspace · Agentic AI Framework PoC
        </div>
        <h1 className="text-4xl font-bold text-[#002244] leading-tight mb-4">
          World Bank AI Agent Platform
        </h1>
        <p className="text-[#5c6670] text-lg leading-relaxed">
          Harness specialized AI agents to accelerate research, analysis, and policy work across World Bank operations — governed end-to-end through the Agent Registry, Tool Registry, and HITL review gate.
        </p>
      </div>

      {/* Chat Card */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-[#d8dde2] overflow-hidden">
        <div className="bg-[#002244] px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#009fda] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">World Bank AI Assistant</p>
            <p className="text-[#8a95a0] text-xs">Specialist agents for research, data & policy</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#4cc180]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a651] animate-pulse" />
            Online · Staging
          </span>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-end gap-3 bg-[#f8f9fa] rounded-xl border border-[#d8dde2] focus-within:border-[#009fda] focus-within:ring-2 focus-within:ring-[#009fda]/20 transition-all p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything — initiate an ASA, run a portfolio analysis, retrieve CPF context, generate a policy brief..."
              rows={3}
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
              <span className="hidden sm:inline">Start</span>
            </button>
          </div>
          <p className="text-xs text-[#8a95a0] mt-2 text-center">Enter to start · Shift+Enter for new line</p>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="mt-8 flex gap-6 flex-wrap justify-center">
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
