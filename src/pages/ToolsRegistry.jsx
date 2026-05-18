import { useState, useMemo } from 'react'
import { TOOLS } from '../lib/tools'
import { Wrench, Code, ChevronRight, X, Shield, CircleAlert as AlertCircle, BookOpen, Tag, CircleCheck as CheckCircle, Search, Plus, Building2 } from 'lucide-react'

const CATEGORY_COLORS = {
  Data: 'bg-[#e8f4fc] text-[#0063a3]',
  Document: 'bg-[#fdf2f1] text-[#c0392b]',
  Research: 'bg-[#fff8e6] text-[#c07800]',
  Visualization: 'bg-[#e6f7ee] text-[#00a651]',
  NLP: 'bg-[#f3f0fc] text-[#5b4fc0]',
  Math: 'bg-[#fff3e6] text-[#c05800]',
  Language: 'bg-[#e6f4fa] text-[#006a8e]',
  general: 'bg-[#f0f4f8] text-[#3d4a55]',
}

const AUTH_COLORS = {
  none: 'bg-[#e6f7ee] text-[#00a651]',
  bearer: 'bg-[#fff8e6] text-[#c07800]',
  api_key: 'bg-[#e8f4fc] text-[#0063a3]',
  basic: 'bg-[#f3f0fc] text-[#5b4fc0]',
  oauth2: 'bg-[#fdf2f1] text-[#c0392b]',
}

const CATEGORY_OPTIONS = ['Data', 'Document', 'Research', 'Visualization', 'NLP', 'Math', 'Language', 'general']
const AUTH_OPTIONS = ['none', 'bearer', 'api_key', 'basic', 'oauth2']
const STATUS_OPTIONS = ['active', 'inactive']

const SYSTEM_AFFILIATION_OPTIONS = ['Dataverse', 'SharePoint', 'SAP', 'Azure AI Search', 'Power Platform', 'AWS', 'Other']

const SYSTEM_AFFILIATION_COLORS = {
  'Dataverse':        'bg-[#e8f4fc] text-[#0063a3]',
  'SharePoint':       'bg-[#e6f7ee] text-[#00a651]',
  'SAP':              'bg-[#fff8e6] text-[#c07800]',
  'Azure AI Search':  'bg-[#e8f4fc] text-[#005fa3]',
  'Power Platform':   'bg-[#fdf2f1] text-[#c0392b]',
  'AWS':              'bg-[#fff3e6] text-[#b85c00]',
  'Other':            'bg-[#f0f4f8] text-[#5c6670]',
}

const EMPTY_TOOL = {
  name: '',
  version: '1.0',
  category: 'Data',
  status: 'active',
  system_affiliation: '',
  description: '',
  maintainer: '',
  input_schema: {},
  output_schema: {},
  authentication: { type: 'none', notes: '', header: null, token_env_var: null },
  rate_limits: { requests_per_minute: 60, daily_quota: 10000, burst_limit: 10, retry_after_header: 'Retry-After', throttle_policy: 'Fixed window per IP address' },
  usage_policies: [],
  tags: [],
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

function Section({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
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
        {open
          ? <svg className="w-3.5 h-3.5 text-[#8a95a0]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
          : <ChevronRight className="w-3.5 h-3.5 text-[#8a95a0]" />
        }
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

function ToolDrawer({ tool, onClose }) {
  const catColor = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.general
  const authColor = AUTH_COLORS[tool.authentication?.type] || AUTH_COLORS.none

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col slide-in">
        <div className="bg-[#002244] px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#40bfe8]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{tool.name}</h2>
                <p className="text-[#8a95a0] text-xs font-mono mt-0.5">ID: {tool.id} · v{tool.version}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-[#8a95a0] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${catColor}`}>{tool.category}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${authColor}`}>
              auth: {tool.authentication?.type}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#e6f7ee]/20 text-[#4cc180] text-xs font-semibold capitalize">{tool.status}</span>
            {tool.system_affiliation && (
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${SYSTEM_AFFILIATION_COLORS[tool.system_affiliation] || SYSTEM_AFFILIATION_COLORS['Other']}`}>
                <Building2 className="w-2.5 h-2.5" />
                {tool.system_affiliation}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
          <Section icon={Tag} title="Overview">
            <div className="space-y-3">
              <p className="text-sm text-[#3d4a55] leading-relaxed">{tool.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-0.5">Maintainer</p>
                  <p className="text-sm font-medium text-[#1a2430]">{tool.maintainer}</p>
                </div>
                <div className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-0.5">Version</p>
                  <p className="text-sm font-medium text-[#1a2430]">v{tool.version}</p>
                </div>
                {tool.system_affiliation && (
                  <div className="col-span-2 bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-1">System Affiliation</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SYSTEM_AFFILIATION_COLORS[tool.system_affiliation] || SYSTEM_AFFILIATION_COLORS['Other']}`}>
                      <Building2 className="w-3 h-3" />
                      {tool.system_affiliation}
                    </span>
                  </div>
                )}
              </div>
              {tool.tags && (
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#f0f4f8] text-[#5c6670] text-[10px] font-medium rounded-full border border-[#e0e6eb]">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <Section icon={Code} title="Input Schema">
            <SchemaBlock data={tool.input_schema} />
          </Section>

          <Section icon={Code} title="Output Schema">
            <SchemaBlock data={tool.output_schema} />
          </Section>

          <Section icon={Shield} title="Authentication Requirements">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${authColor}`}>
                  {tool.authentication?.type === 'none' ? 'No Auth Required' : tool.authentication?.type}
                </span>
              </div>
              <p className="text-sm text-[#3d4a55] leading-relaxed">{tool.authentication?.notes}</p>
              {tool.authentication?.header && (
                <div className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-1">Request Header</p>
                  <code className="text-xs font-mono text-[#0063a3]">{tool.authentication.header}</code>
                </div>
              )}
              {tool.authentication?.token_env_var && (
                <div className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-1">Environment Variable</p>
                  <code className="text-xs font-mono text-[#c0392b]">{tool.authentication.token_env_var}</code>
                </div>
              )}
            </div>
          </Section>

          <Section icon={AlertCircle} title="Rate Limits">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(tool.rate_limits).map(([key, value]) => (
                <div key={key} className="bg-[#f8f9fa] border border-[#eef0f2] rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8a95a0] uppercase tracking-wider mb-0.5">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-bold text-[#002244]">{String(value)}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={BookOpen} title="Usage Policies">
            <ul className="space-y-2">
              {tool.usage_policies.map((policy, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#009fda] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#3d4a55] leading-relaxed">{policy}</span>
                </li>
              ))}
            </ul>
          </Section>
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

function AddToolModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_TOOL)
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const setAuth = (key, value) => setForm(f => ({ ...f, authentication: { ...f.authentication, [key]: value } }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.maintainer.trim()) e.maintainer = 'Maintainer is required'
    if (!form.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onAdd({
      ...form,
      id: `tool-custom-${Date.now()}`,
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
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-[#40bfe8]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Register New Tool</h2>
              <p className="text-[#8a95a0] text-xs">Add an integration to the tools registry</p>
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
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Tool Name <span className="text-[#c0392b]">*</span></label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Climate Data API"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 text-[#1a2430] placeholder:text-[#b0b8c1] ${errors.name ? 'border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]/20' : 'border-[#d8dde2] focus:border-[#009fda] focus:ring-[#009fda]/20'}`}
                />
                {errors.name && <p className="text-[#c0392b] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Maintainer <span className="text-[#c0392b]">*</span></label>
                <input
                  value={form.maintainer}
                  onChange={e => set('maintainer', e.target.value)}
                  placeholder="e.g. Infrastructure Team"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 text-[#1a2430] placeholder:text-[#b0b8c1] ${errors.maintainer ? 'border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]/20' : 'border-[#d8dde2] focus:border-[#009fda] focus:ring-[#009fda]/20'}`}
                />
                {errors.maintainer && <p className="text-[#c0392b] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.maintainer}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Version</label>
                <input
                  value={form.version}
                  onChange={e => set('version', e.target.value)}
                  placeholder="1.0"
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Description <span className="text-[#c0392b]">*</span></label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="What does this tool do and when should agents use it?"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 text-[#1a2430] placeholder:text-[#b0b8c1] resize-none ${errors.description ? 'border-[#c0392b] focus:border-[#c0392b] focus:ring-[#c0392b]/20' : 'border-[#d8dde2] focus:border-[#009fda] focus:ring-[#009fda]/20'}`}
                />
                {errors.description && <p className="text-[#c0392b] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] bg-white"
                >
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#0063a3]" /> System Affiliation
                </label>
                <select
                  value={form.system_affiliation}
                  onChange={e => set('system_affiliation', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] bg-white"
                >
                  <option value="">None</option>
                  {SYSTEM_AFFILIATION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#0063a3]" /> Authentication
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Auth Type</label>
                <select
                  value={form.authentication.type}
                  onChange={e => setAuth('type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] bg-white"
                >
                  {AUTH_OPTIONS.map(a => <option key={a} value={a}>{a === 'none' ? 'None (Public)' : a}</option>)}
                </select>
              </div>
              {form.authentication.type !== 'none' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Request Header</label>
                    <input
                      value={form.authentication.header || ''}
                      onChange={e => setAuth('header', e.target.value || null)}
                      placeholder="e.g. Authorization: Bearer"
                      className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Env Variable</label>
                    <input
                      value={form.authentication.token_env_var || ''}
                      onChange={e => setAuth('token_env_var', e.target.value || null)}
                      placeholder="e.g. API_TOKEN"
                      className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1] font-mono"
                    />
                  </div>
                </>
              )}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#3d4a55] mb-1.5">Auth Notes</label>
                <input
                  value={form.authentication.notes}
                  onChange={e => setAuth('notes', e.target.value)}
                  placeholder="Additional notes about authentication..."
                  className="w-full px-3 py-2 text-sm border border-[#d8dde2] rounded-lg focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1]"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#0063a3]" /> Tags
            </h3>
            <TagInput value={form.tags} onChange={v => set('tags', v)} placeholder="Type a tag and press Enter or Add" />
          </div>

          {/* Usage Policies */}
          <div>
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#0063a3]" /> Usage Policies
            </h3>
            <TagInput value={form.usage_policies} onChange={v => set('usage_policies', v)} placeholder="Type a policy and press Enter or Add" />
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
              Register Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ToolCard({ tool, onSelect }) {
  const catColor = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.general
  const authColor = AUTH_COLORS[tool.authentication?.type] || AUTH_COLORS.none

  return (
    <div className="bg-white rounded-xl border border-[#d8dde2] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden fade-in group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eef0f2] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e0e6eb] transition-colors">
              <Wrench className="w-4 h-4 text-[#5c6670]" />
            </div>
            <div>
              <h3 className="font-bold text-[#002244] text-sm">{tool.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${catColor}`}>{tool.category}</span>
                <span className="text-[10px] font-mono text-[#8a95a0]">v{tool.version}</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#e6f7ee] text-[#00a651] uppercase tracking-wide">
            {tool.status}
          </span>
        </div>

        <p className="text-xs text-[#5c6670] leading-relaxed mb-3 line-clamp-2">{tool.description}</p>
        <p className="text-[10px] text-[#8a95a0] font-medium mb-3">{tool.maintainer}</p>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${authColor}`}>
            <Shield className="w-2.5 h-2.5" />
            {tool.authentication?.type === 'none' ? 'Public' : tool.authentication?.type}
          </span>
          {tool.system_affiliation && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${SYSTEM_AFFILIATION_COLORS[tool.system_affiliation] || SYSTEM_AFFILIATION_COLORS['Other']}`}>
              <Building2 className="w-2.5 h-2.5" />
              {tool.system_affiliation}
            </span>
          )}
          {tool.rate_limits?.requests_per_minute && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f0f4f8] text-[#3d4a55]">
              {tool.rate_limits.requests_per_minute} req/min
            </span>
          )}
          {tool.tags?.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-[#f0f4f8] text-[#3d4a55] text-[10px] font-medium border border-[#e0e6eb]">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#8a95a0] mb-4 border-t border-[#eef0f2] pt-3">
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{tool.usage_policies?.length} usage policies</span>
          <span className="flex items-center gap-1"><Code className="w-3 h-3" />Schemas defined</span>
        </div>

        <button
          onClick={() => onSelect(tool)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d8dde2] text-[#5c6670] text-xs font-medium rounded-lg hover:border-[#0063a3] hover:text-[#0063a3] transition-all"
        >
          View Full Spec
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default function ToolsRegistry() {
  const [tools, setTools] = useState(TOOLS)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAuth, setFilterAuth] = useState('all')

  const handleAdd = (tool) => {
    setTools(prev => [tool, ...prev])
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return tools.filter(t => {
      const matchesQuery = !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.maintainer.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory
      const matchesAuth = filterAuth === 'all' || t.authentication?.type === filterAuth
      return matchesQuery && matchesCategory && matchesAuth
    })
  }, [tools, query, filterCategory, filterAuth])

  const usedCategories = useMemo(() => [...new Set(tools.map(t => t.category))], [tools])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002244]">Tools Registry</h1>
          <p className="text-[#5c6670] text-sm mt-1">Approved integrations available to AI agents — including schemas, authentication, rate limits, and usage policies.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#009fda] text-white text-sm font-semibold rounded-xl hover:bg-[#0087bf] transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Tools', value: tools.length, color: 'text-[#002244]' },
          { label: 'Active', value: tools.filter(t => t.status === 'active').length, color: 'text-[#00a651]' },
          { label: 'Requires Auth', value: tools.filter(t => t.authentication?.type !== 'none').length, color: 'text-[#c07800]' },
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
            placeholder="Search tools by name, category, maintainer, tags..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#d8dde2] rounded-xl focus:outline-none focus:border-[#009fda] focus:ring-1 focus:ring-[#009fda]/20 text-[#1a2430] placeholder:text-[#b0b8c1] bg-white"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a0] hover:text-[#5c6670] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#d8dde2] rounded-xl focus:outline-none focus:border-[#009fda] bg-white text-[#3d4a55] min-w-[140px]"
        >
          <option value="all">All Categories</option>
          {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterAuth}
          onChange={e => setFilterAuth(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[#d8dde2] rounded-xl focus:outline-none focus:border-[#009fda] bg-white text-[#3d4a55] min-w-[140px]"
        >
          <option value="all">All Auth Types</option>
          {AUTH_OPTIONS.map(a => <option key={a} value={a}>{a === 'none' ? 'None (Public)' : a}</option>)}
        </select>
      </div>

      {/* Results count */}
      {(query || filterCategory !== 'all' || filterAuth !== 'all') && (
        <p className="text-xs text-[#8a95a0] mb-4">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          {query && <span> for "<span className="font-medium text-[#3d4a55]">{query}</span>"</span>}
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} onSelect={setSelected} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f0f4f8] flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-[#b0b8c1]" />
          </div>
          <p className="text-[#3d4a55] font-semibold text-sm">No tools found</p>
          <p className="text-[#8a95a0] text-xs mt-1">Try adjusting your search or filters</p>
          <button
            onClick={() => { setQuery(''); setFilterCategory('all'); setFilterAuth('all') }}
            className="mt-4 text-xs text-[#009fda] font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {selected && (
        <ToolDrawer tool={selected} onClose={() => setSelected(null)} />
      )}

      {showAdd && (
        <AddToolModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  )
}
