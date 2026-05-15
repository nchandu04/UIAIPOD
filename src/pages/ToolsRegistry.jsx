import { useState } from 'react'
import { TOOLS } from '../lib/tools'
import { Wrench, Code, ChevronRight, X, Shield, CircleAlert as AlertCircle, BookOpen, Tag, CircleCheck as CheckCircle } from 'lucide-react'

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
        {/* Header */}
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
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
          {/* Overview */}
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

          {/* Input Schema */}
          <Section icon={Code} title="Input Schema">
            <SchemaBlock data={tool.input_schema} />
          </Section>

          {/* Output Schema */}
          <Section icon={Code} title="Output Schema">
            <SchemaBlock data={tool.output_schema} />
          </Section>

          {/* Authentication */}
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

          {/* Rate Limits */}
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

          {/* Usage Policies */}
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

        {/* Auth + rate limit summary */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${authColor}`}>
            <Shield className="w-2.5 h-2.5" />
            {tool.authentication?.type === 'none' ? 'Public' : tool.authentication?.type}
          </span>
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

        {/* Policy count */}
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
  const [selected, setSelected] = useState(null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#002244]">Tools Registry</h1>
        <p className="text-[#5c6670] text-sm mt-1">Approved integrations available to AI agents — including schemas, authentication, rate limits, and usage policies.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Tools', value: TOOLS.length, color: 'text-[#002244]' },
          { label: 'Active', value: TOOLS.filter(t => t.status === 'active').length, color: 'text-[#00a651]' },
          { label: 'Requires Auth', value: TOOLS.filter(t => t.authentication?.type !== 'none').length, color: 'text-[#c07800]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#d8dde2] px-5 py-4 text-center shadow-sm">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#8a95a0] font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {TOOLS.map(tool => (
          <ToolCard key={tool.id} tool={tool} onSelect={setSelected} />
        ))}
      </div>

      {selected && (
        <ToolDrawer tool={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
