import { useState } from 'react'
import { LayoutDashboard, FileText, Scale, Sparkles, Calendar, File, BookOpen, Gavel, TrendingUp, LogOut } from 'lucide-react'
import { ResearchView } from './components/ResearchView'
import { TimelineComponent } from './components/TimelineComponent'
import { DiscoveryBuilder } from './components/DiscoveryBuilder'
import { FileManager } from './components/FileManager'
import { AssistantView } from './components/AssistantView'
import { MotionDrafter } from './components/MotionDrafter'
import { CaseAnalytics } from './components/CaseAnalytics'
import { SearchView } from './components/SearchView'
import { CaseSelector } from './components/CaseSelector'
import { Bot } from 'lucide-react'
import { useCase } from './context/CaseContext'


function App() {
  const [activeTab, setActiveTab] = useState('assistant')
  const { selectedCase, setSelectedCase, availableCases, caseName } = useCase()

  if (!selectedCase) {
    return <CaseSelector cases={availableCases} onSelect={setSelectedCase} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <Scale className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">LegalMind</h1>
            <div className="text-xs text-muted-foreground">{caseName}</div>
          </div>
        </div>

        <nav className="space-y-2">
          <NavItem
            icon={<Bot />}
            label="Case Assistant"
            active={activeTab === 'assistant'}
            onClick={() => setActiveTab('assistant')}
          />
          <NavItem
            icon={<Search />}
            label="Document Search"
            active={activeTab === 'search'}
            onClick={() => setActiveTab('search')}
          />
          <NavItem
            icon={<LayoutDashboard />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<FileText />}
            label="Discovery Generator"
            active={activeTab === 'drafter'}
            onClick={() => setActiveTab('drafter')}
          />
          <NavItem
            icon={<Calendar />}
            label="Deadline Timeline"
            active={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
          />
          <NavItem
            icon={<File />}
            label="Evidence Locker"
            active={activeTab === 'evidence'}
            onClick={() => setActiveTab('evidence')}
          />
          <NavItem
            icon={<Gavel />}
            label="Motion Drafter"
            active={activeTab === 'motions'}
            onClick={() => setActiveTab('motions')}
          />
          <NavItem
            icon={<TrendingUp />}
            label="Case Analytics"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              JS
            </div>
            <div className="text-sm">
              <div className="font-medium">Jeffrey [Client]</div>
              <div className="text-muted-foreground text-xs">Plaintiff</div>
            </div>
          </div>
          <button
            onClick={() => setSelectedCase(null)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-white transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Switch Case
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'assistant' && (
          <AssistantView
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'search' && <SearchView />}
        {activeTab === 'research' && <ResearchView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'timeline' && <TimelineComponent />}
        {activeTab === 'drafter' && <DiscoveryBuilder />}
        {activeTab === 'evidence' && <FileManager />}
        {activeTab === 'motions' && <MotionDrafter />}
        {activeTab === 'analytics' && <CaseAnalytics />}
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${active
        ? 'bg-primary/20 text-primary'
        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        }`}
    >
      {/* Clone icon to enforce size if needed, though Lucide usually handles defaults well */}
      <span className="w-5 h-5">{icon}</span>
      {label}
    </button>
  )
}

function DashboardView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Good Afternoon, Jane</h2>
        <p className="text-muted-foreground">Here is an overview of your active matters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Cases" value="12" change="+2 this week" />
        <StatCard title="Drafts Pending" value="3" change="Due today" />
        <StatCard title="Hours Saved" value="4.5" change="By AI this week" />
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem
            title="Motion for Summary Judgment"
            caseName="Smith v. Jones"
            time="2 hours ago"
            type="draft"
          />
          <ActivityItem
            title="Case Analysis"
            caseName="Estate of H. Potts"
            time="4 hours ago"
            type="insight"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change }) {
  return (
    <div className="bg-card border border-white/5 rounded-xl p-6">
      <div className="text-muted-foreground text-sm font-medium mb-2">{title}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-emerald-400">{change}</div>
    </div>
  )
}

function ActivityItem({ title, caseName, time, type }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'draft' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
          }`}>
          {type === 'draft' ? <FileText className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{caseName}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </div>
  )
}

export default App
