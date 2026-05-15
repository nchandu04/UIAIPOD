import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AGENTS } from '../lib/agents'
import { Bot, MessageSquare, ChevronDown, ChevronUp, X, ChevronRight, Shield, Cpu, Clock, Users, Wrench, Brain, Zap, FileCode, ArrowUpRight, Tag, CircleCheck as CheckCircle } from 'lucide-react'

const APPROVAL_COLORS = {
  Approved: 'bg-[#e6f7ee] text-[#00a651]',
  Pending: 'bg-[#fff8e6] text-[#c07800]',
  Rejected: 'bg-[#fdf2f1] text-[#c0392b]',
}

function Section({ icon: Icon, title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-[#eef0f2] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] hover:bg-[#eef0f2] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-[#0063a3]" />
          <span className="text-xs font-semibold text-[#002244] uppercase tracking-wide">{title}</span>
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-[#8a95a0]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8a95a0]" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

function SchemaBlock({ data }) {
  return (
    <div className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg p-3 overflow-x-auto">
      <pre className="text-[11px] font-mono text-[#3d4a55] whitespace-pre leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

function AgentDrawer({ agent, onClose, onChat }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Drawer */}
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col slide-in">
        {/* Header */}
        <div className="bg-[#002244] px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#009fda]/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#40bfe8]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">{agent.name}</h2>
                <p className="text-[#8a95a0] text-xs font-mono mt-0.5">ID: {agent.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-[#8a95a0] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#009fda]/20 text-[#40bfe8] text-xs font-semibold">v{agent.version}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${APPROVAL_COLORS[agent.approval_status] || ''}`}>
              {agent.approval_status}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#e6f7ee]/20 text-[#4cc180] text-xs font-semibold capitalize">{agent.status}</span>
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
          {/* Identity */}
          <Section icon={Tag} title="Identity & Ownership">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: 'Owner', value: agent.owner },
                { label: 'Version', value: agent.version },
                { label: 'Approval Status', value: agent.approval_status },
                { label: 'Agent Status', value: agent.status },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm text-[#1a2430] font-medium">{value}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-[#3d4a55] leading-relaxed">{agent.description}</p>
              </div>
            </div>
          </Section>

          {/* Skills */}
          <Section icon={Zap} title="Skills">
            <div className="flex flex-wrap gap-2">
              {agent.skills.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e8f4fc] text-[#0063a3] text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  {s}
                </span>
              ))}
            </div>
          </Section>

          {/* Supported Intents */}
          <Section icon={Brain} title="Supported Intents">
            <div className="flex flex-wrap gap-2">
              {agent.supported_intents.map((intent, i) => (
                <code key={i} className="px-2 py-1 bg-[#f0f4f8] text-[#3d4a55] text-xs rounded font-mono border border-[#e0e6eb]">
                  {intent}
                </code>
              ))}
            </div>
          </Section>

          {/* Input Schema */}
          <Section icon={FileCode} title="Input Schema">
            <SchemaBlock data={agent.input_schema} />
          </Section>

          {/* Output Schema */}
          <Section icon={FileCode} title="Output Schema">
            <SchemaBlock data={agent.output_schema} />
          </Section>

          {/* Runtime Config */}
          <Section icon={Cpu} title="Runtime Configuration">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {Object.entries(agent.runtime_config).map(([key, value]) => (
                <div key={key} className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-0.5">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-bold text-[#002244]">{String(value)}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Tools Used */}
          <Section icon={Wrench} title="Tools Used">
            <div className="flex flex-wrap gap-2">
              {agent.tools_used.map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e6f7ee] text-[#00a651] text-xs font-semibold rounded-lg border border-[#00a651]/20">
                  <Wrench className="w-3 h-3" />
                  {t}
                </span>
              ))}
            </div>
          </Section>

          {/* Memory Settings */}
          <Section icon={Brain} title="Memory Settings">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(agent.memory_settings).map(([key, value]) => (
                <div key={key} className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-0.5">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-bold text-[#002244]">{String(value)}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Timeout + Roles */}
          <Section icon={Clock} title="Timeout & Access Control">
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-4 py-3">
                <Clock className="w-4 h-4 text-[#0063a3]" />
                <span className="text-sm text-[#3d4a55]">Timeout</span>
                <span className="ml-auto text-sm font-bold text-[#002244]">{agent.timeout_seconds}s</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  Allowed User Roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.allowed_user_roles.map((role, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fff8e6] text-[#7a4e00] text-xs font-semibold rounded-full border border-[#f5a623]/30">
                      <Shield className="w-3 h-3" />
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[#eef0f2] bg-white">
          <button
            onClick={() => onChat(agent)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#009fda] text-white font-semibold text-sm rounded-xl hover:bg-[#0087bf] transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Open Chat Terminal
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function AgentCard({ agent, onSelect, onChat }) {
  return (
    <div className="bg-white rounded-xl border border-[#d8dde2] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden fade-in group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#e8f4fc] flex items-center justify-center flex-shrink-0 group-hover:bg-[#d0eaf8] transition-colors">
              <Bot className="w-5 h-5 text-[#0063a3]" />
            </div>
            <div>
              <h3 className="font-bold text-[#002244] text-sm">{agent.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-[#8a95a0]">{agent.id}</span>
                <span className="text-[#d8dde2]">·</span>
                <span className="text-[10px] font-semibold text-[#8a95a0]">v{agent.version}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${APPROVAL_COLORS[agent.approval_status] || ''}`}>
              {agent.approval_status}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f7ee] text-[#00a651] uppercase tracking-wide">
              {agent.status}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#5c6670] leading-relaxed mb-4 line-clamp-2">{agent.description}</p>

        {/* Owner */}
        <p className="text-[10px] text-[#8a95a0] font-medium mb-3 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {agent.owner}
        </p>

        {/* Skills preview */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.skills.slice(0, 3).map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-[#f0f4f8] text-[#3d4a55] text-[10px] font-medium border border-[#e0e6eb]">
              {s}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-[#f0f4f8] text-[#8a95a0] text-[10px] font-medium border border-[#e0e6eb]">
              +{agent.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[10px] text-[#8a95a0] mb-4 border-t border-[#eef0f2] pt-3">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{agent.runtime_config.model}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{agent.timeout_seconds}s</span>
          <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{agent.tools_used.length} tools</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChat(agent)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#009fda] text-white text-xs font-semibold rounded-lg hover:bg-[#0087bf] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => onSelect(agent)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d8dde2] text-[#5c6670] text-xs font-medium rounded-lg hover:border-[#0063a3] hover:text-[#0063a3] transition-all"
          >
            View Details
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AgentRegistry() {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const handleChat = (agent) => {
    navigate('/chat', { state: { agent } })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#002244]">Agent Registry</h1>
        <p className="text-[#5c6670] text-sm mt-1">Approved AI agents available for World Bank operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Agents', value: AGENTS.length, color: 'text-[#002244]' },
          { label: 'Active', value: AGENTS.filter(a => a.status === 'active').length, color: 'text-[#00a651]' },
          { label: 'Approved', value: AGENTS.filter(a => a.approval_status === 'Approved').length, color: 'text-[#0063a3]' },
          { label: 'Tools Available', value: [...new Set(AGENTS.flatMap(a => a.tools_used))].length, color: 'text-[#c07800]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#d8dde2] px-5 py-4 text-center shadow-sm">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#8a95a0] font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {AGENTS.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={setSelected}
            onChat={handleChat}
          />
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <AgentDrawer
          agent={selected}
          onClose={() => setSelected(null)}
          onChat={(a) => { setSelected(null); handleChat(a) }}
        />
      )}
    </div>
  )
}
