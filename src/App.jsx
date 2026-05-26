import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AgentRegistry from './pages/AgentRegistry'
import ToolsRegistry from './pages/ToolsRegistry'
import ChatTerminal from './pages/ChatTerminal'
import Documentation from './pages/Documentation'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agents" element={<AgentRegistry />} />
          <Route path="/tools" element={<ToolsRegistry />} />
          <Route path="/chat" element={<ChatTerminal />} />
          <Route path="/docs" element={<Documentation />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
