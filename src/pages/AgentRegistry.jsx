import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AGENTS } from '../lib/agents'
import { Bot, MessageSquare, ChevronDown, ChevronUp, X, ChevronRight, Shield, Cpu, Clock, Users, Wrench, Brain, Zap, FileCode, ArrowUpRight, Tag, CircleCheck as CheckCircle, Search, Plus, CircleAlert as AlertCircle, History, Lock } from 'lucide-react'

const APPROVAL_COLORS = {
  Approved: 'bg-[#e6f7ee] text-[#00a651]',
  Pending: 'bg-[#fff8e6] text-[#c07800]',
  Rejected: 'bg-[#fdf2f1] text-[#c0392b]',
}

const APPROVAL_OPTIONS = ['Approved', 'Pending', 'Rejected']
const STATUS_OPTIONS = ['active', 'inactive']
const DATA_CLASSIFICATION_OPTIONS = ['Public', 'Official Use Only', 'Confidential', 'Strictly Confidential']

const DATA_CLASSIFICATION_COLORS = {
  'Public': 'bg-[#e6f7ee] text-[#00a651]',
  'Official Use Only': 'bg-[#e8f4fc] text-[#0063a3]',
  'Confidential': 'bg-[#fff8e6] text-[#c07800]',
  'Strictly Confidential': 'bg-[#fdf2f1] text-[#c0392b]',
}

const AUDIT_EVENT_COLORS = {
  created:   'bg-[#e8f4fc] text-[#0063a3]',
  updated:   'bg-[#fff8e6] text-[#c07800]',
  approved:  'bg-[#e6f7ee] text-[#00a651]',
  rejected:  'bg-[#fdf2f1] text-[#c0392b]',
  deprecated:'bg-[#f0f4f8] text-[#5c6670]',
  promoted:  'bg-[#e6f7ee] text-[#00a651]',
}

const EMPTY_AGENT = {
  name: '',
  version: '1.0.0',
  owner: '',
  description: '',
  status: 'active',
  approval_status: 'Pending',
  data_classification: 'Official Use Only',
  allowed_user_roles: [],
  skills: [],
  supported_intents: [],
  input_schema: {},
  output_schema: {},
  runtime_config: { model: 'gpt-4o', temperature: 0.2, max_tokens: 4096, top_p: 0.95, frequency_penalty: 0.1 },
  tools_used: [],
  memory_settings: {},
  timeout_seconds: 60,
  audit_log: [],
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
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col slide-in">
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
            {agent.data_classification && (
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${DATA_CLASSIFICATION_COLORS[agent.data_classification] || 'bg-[#f0f4f8] text-[#5c6670]'}`}>
                <Lock className="w-2.5 h-2.5" />
                {agent.data_classification}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
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
              {agent.data_classification && (
                <div>
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-0.5">Data Classification</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${DATA_CLASSIFICATION_COLORS[agent.data_classification] || 'bg-[#f0f4f8] text-[#5c6670]'}`}>
                    <Lock className="w-2.5 h-2.5" />
                    {agent.data_classification}
                  </span>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-[#3d4a55] leading-relaxed">{agent.description}</p>
              </div>
            </div>
          </Section>

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

          <Section icon={Brain} title="Supported Intents">
            <div className="flex flex-wrap gap-2">
              {agent.supported_intents.map((intent, i) => (
                <code key={i} className="px-2 py-1 bg-[#f0f4f8] text-[#3d4a55] text-xs rounded font-mono border border-[#e0e6eb]">
                  {intent}
                </code>
              ))}
            </div>
          </Section>

          <Section icon={FileCode} title="Input Schema">
            <SchemaBlock data={agent.input_schema} />
          </Section>

          <Section icon={FileCode} title="Output Schema">
            <SchemaBlock data={agent.output_schema} />
          </Section>

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

          {agent.audit_log && agent.audit_log.length > 0 && (
            <Section icon={History} title="Audit & Version History">
              <div className="space-y-2">
                {[...agent.audit_log].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-[#f0f4f8] last:border-0">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${AUDIT_EVENT_COLORS[entry.event] || 'bg-[#f0f4f8] text-[#5c6670]'}`}>
                        {entry.event}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1a2430] truncate">{entry.actor}</p>
                      {entry.delta && (
                        <p className="text-[11px] text-[#5c6670] mt-0.5">
                          {typeof entry.delta === 'object'
                            ? Object.entries(entry.delta).map(([k, v]) => `${k}: ${v}`).join(' · ')
                            : String(entry.delta)}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8a95a0] font-mono flex-shrink-0">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

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

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  const remove = (item) => onChange(value.filter(v => v !== item))

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1]"
        />
        <button type="button" onClick={add} className="px-3 py-2 bg-[#f0f4f8] border border-[#d8dde2] text-[#5c6670] text-xs font-medium rounded-lg hover:bg-[#e0e6eb] transition-colors">
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-[#e8f4fc] text-[#0063a3] text-xs font-medium rounded-full">
              {item}
              <button type="button" onClick={() => remove(item)} className="hover:text-[#c0392b] transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function AddAgentModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_AGENT)
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.owner.trim()) e.owner = 'Owner is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onAdd({
      ...form,
      id: `agt-custom-${Date.now()}`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="sticky top-0 bg-[#002244] px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#009fda]/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#40bfe8]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Register New Agent</h2>
              <p className="text-[#8a95a0] text-xs">Fill in the details to add an agent to the registry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-[#8a95a0] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#0063a3]" /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Agent Name <span className="text-[#c0392b]">*</span></label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Policy Research Agent"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 text-[#1a2430] placeholder:text-[#b0b8c1] ${errors.name ? 'border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]/20' : 'border-[#d8dde2] focus:border-[#009fda] focus:ring-[#009fda]/20'}`}
                />
                {errors.name && <p className="text-[#c0392b] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Owner / Team <span className="text-[#c0392b]">*</span></label>
                <input
                  value={form.owner}
                  onChange={e => set('owner', e.target.value)}
                  placeholder="e.g. Development Data Group"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 text-[#1a2430] placeholder:text-[#b0b8c1] ${errors.owner ? 'border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]/20' : 'border-[#d8dde2] focus:border-[#009fda] focus:ring-[#009fda]/20'}`}
                />
                {errors.owner && <p className="text-[#c0392b] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.owner}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Version</label>
                <input
                  value={form.version}
                  onChange={e => set('version', e.target.value)}
                  placeholder="1.0.0"
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Description <span className="text-[#c0392b]">*</span></label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe what this agent does and its primary use cases..."
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 text-[#1a2430] placeholder:text-[#b0b8c1] resize-none ${errors.description ? 'border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]/20' : 'border-[#d8dde2] focus:border-[#009fda] focus:ring-[#009fda]/20'}`}
                />
                {errors.description && <p className="text-[#c0392b] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] bg-white"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Approval Status</label>
                <select
                  value={form.approval_status}
                  onChange={e => set('approval_status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] bg-white"
                >
                  {APPROVAL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#0063a3]" /> Data Classification
                </label>
                <select
                  value={form.data_classification}
                  onChange={e => set('data_classification', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] bg-white"
                >
                  {DATA_CLASSIFICATION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Timeout (seconds)</label>
                <input
                  type="number"
                  min={1}
                  value={form.timeout_seconds}
                  onChange={e => set('timeout_seconds', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430]"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#0063a3]" /> Skills
            </h3>
            <TagInput value={form.skills} onChange={v => set('skills', v)} placeholder="Type a skill and press Enter or Add" />
          </div>

          {/* Supported Intents */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-[#0063a3]" /> Supported Intents
            </h3>
            <TagInput value={form.supported_intents} onChange={v => set('supported_intents', v)} placeholder="e.g. analyze_data" />
          </div>

          {/* Tools Used */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-[#0063a3]" /> Tools Used
            </h3>
            <TagInput value={form.tools_used} onChange={v => set('tools_used', v)} placeholder="e.g. World Bank API" />
          </div>

          {/* Allowed Roles */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#0063a3]" /> Allowed User Roles
            </h3>
            <TagInput value={form.allowed_user_roles} onChange={v => set('allowed_user_roles', v)} placeholder="e.g. Economist" />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#eef0f2]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#d8dde2] text-[#5c6670] text-sm font-medium rounded-xl hover:bg-[#f0f4f8] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#009fda] text-white text-sm font-semibold rounded-xl hover:bg-[#0087bf] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Register Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AgentCard({ agent, onSelect, onChat }) {
  return (
    <div className="bg-white rounded-xl border border-[#d8dde2] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden fade-in group">
      <div className="p-5">
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
            {agent.data_classification && (
              <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${DATA_CLASSIFICATION_COLORS[agent.data_classification] || 'bg-[#f0f4f8] text-[#5c6670]'}`}>
                <Lock className="w-2.5 h-2.5" />
                {agent.data_classification}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-[#5c6670] leading-relaxed mb-4 line-clamp-2">{agent.description}</p>

        <p className="text-[10px] text-[#8a95a0] font-medium mb-3 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {agent.owner}
        </p>

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

        <div className="flex items-center gap-3 text-[10px] text-[#8a95a0] mb-4 border-t border-[#eef0f2] pt-3">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{agent.runtime_config.model}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{agent.timeout_seconds}s</span>
          <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{agent.tools_used.length} tools</span>
        </div>

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
  const [agents, setAgents] = useState(AGENTS)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterApproval, setFilterApproval] = useState('all')
  const navigate = useNavigate()

  const handleChat = (agent) => {
    navigate('/chat', { state: { agent } })
  }

  const handleAdd = (agent) => {
    const withAudit = {
      ...agent,
      audit_log: [
        {
          event: 'created',
          actor: 'current-user@worldbank.org',
          timestamp: new Date().toISOString(),
          delta: { version: agent.version, status: agent.status, approval_status: agent.approval_status },
        },
      ],
    }
    setAgents(prev => [withAudit, ...prev])
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return agents.filter(a => {
      const matchesQuery = !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q) ||
        a.skills.some(s => s.toLowerCase().includes(q)) ||
        a.tools_used.some(t => t.toLowerCase().includes(q))
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus
      const matchesApproval = filterApproval === 'all' || a.approval_status === filterApproval
      return matchesQuery && matchesStatus && matchesApproval
    })
  }, [agents, query, filterStatus, filterApproval])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002244]">Agent Registry</h1>
          <p className="text-[#5c6670] text-sm mt-1">Approved AI agents available for World Bank operations</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#009fda] text-white text-sm font-semibold rounded-xl hover:bg-[#0087bf] transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Agents', value: agents.length, color: 'text-[#002244]' },
          { label: 'Active', value: agents.filter(a => a.status === 'active').length, color: 'text-[#00a651]' },
          { label: 'Approved', value: agents.filter(a => a.approval_status === 'Approved').length, color: 'text-[#0063a3]' },
          { label: 'Tools Available', value: [...new Set(agents.flatMap(a => a.tools_used))].length, color: 'text-[#c07800]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#d8dde2] px-5 py-4 text-center shadow-sm">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#8a95a0] font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a95a0]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search agents by name, owner, skills, tools..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#d8dde2] rounded-xl focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1] bg-white"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a0] hover:text-[#5c6670] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#d8dde2] rounded-xl focus:outline-none focus:border-[#009fda] bg-white text-[#3d4a55] min-w-[130px]"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select
          value={filterApproval}
          onChange={e => setFilterApproval(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#d8dde2] rounded-xl focus:outline-none focus:border-[#009fda] bg-white text-[#3d4a55] min-w-[150px]"
        >
          <option value="all">All Approvals</option>
          {APPROVAL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Results count */}
      {(query || filterStatus !== 'all' || filterApproval !== 'all') && (
        <p className="text-xs text-[#8a95a0] mb-4">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          {query && <span> for "<span className="font-medium text-[#3d4a55]">{query}</span>"</span>}
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={setSelected}
              onChat={handleChat}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f0f4f8] flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-[#b0b8c1]" />
          </div>
          <p className="text-[#3d4a55] font-semibold text-sm">No agents found</p>
          <p className="text-[#8a95a0] text-xs mt-1">Try adjusting your search or filters</p>
          <button
            onClick={() => { setQuery(''); setFilterStatus('all'); setFilterApproval('all') }}
            className="mt-4 text-xs text-[#009fda] font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {selected && (
        <AgentDrawer
          agent={selected}
          onClose={() => setSelected(null)}
          onChat={(a) => { setSelected(null); handleChat(a) }}
        />
      )}

      {showAdd && (
        <AddAgentModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  )
}
