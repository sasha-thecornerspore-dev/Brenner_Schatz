import { useState, useEffect } from 'react'
import { BookOpen, RefreshCw, Download, Search } from 'lucide-react'
import { useCase } from '../context/CaseContext'

export function ResearchView() {
    const [research, setResearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('general')
    const { selectedCase } = useCase()

    const runResearch = async (type) => {
        setLoading(true)
        setActiveTab(type)
        try {
            const res = await fetch(`/api/research?type=${type}&caseId=${selectedCase}`)
            const data = await res.json()
            setResearch(data.report)
        } catch (err) {
            console.error(err)
            setResearch("# Error\n\nFailed to load research data.")
        } finally {
            setLoading(false)
        }
    }

    // Load general research on mount
    useEffect(() => {
        runResearch('general')
    }, [])

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Deep Research & Case Law
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => runResearch(activeTab)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Analyzing...' : 'Refresh Analysis'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/20 rounded-lg hover:bg-primary/30 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Dossier
                    </button>
                </div>
            </div>

            {/* Research Tabs */}
            <div className="flex gap-4 mb-4 border-b border-white/10 pb-1">
                {['general', 'standing', 'limitations'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => runResearch(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab
                            ? 'bg-card border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-white'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} Analysis
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-card border border-white/5 rounded-xl p-8 overflow-y-auto font-serif leading-relaxed text-lg text-gray-300">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <RefreshCw className="w-12 h-12 mb-4 animate-spin text-primary" />
                        <p>Scanning 2,000+ pages of case files...</p>
                    </div>
                ) : (
                    research.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-2">{line.replace('# ', '')}</h1>
                        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-semibold text-blue-200 mt-8 mb-4">{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-medium text-purple-300 mt-6 mb-3">{line.replace('### ', '')}</h3>
                        if (line.startsWith('* ')) return <li key={i} className="ml-6 mb-2 list-disc">{line.replace('* ', '')}</li>
                        if (line.startsWith('- **')) {
                            const [bold, text] = line.replace('- **', '').split('**: "');
                            return (
                                <div key={i} className="mb-4 pl-4 border-l-2 border-primary/30 bg-white/5 p-3 rounded-r-lg">
                                    <span className="text-primary font-bold text-sm block mb-1">{bold}</span>
                                    <span className="italic text-gray-400">"{text.replace('"', '')}</span>
                                </div>
                            )
                        }
                        if (line === '---') return <hr key={i} className="my-8 border-white/10" />
                        if (line.trim() === '') return <br key={i} />
                        return <p key={i} className="mb-4">{line}</p>
                    })
                )}
            </div>
        </div>
    )
}
