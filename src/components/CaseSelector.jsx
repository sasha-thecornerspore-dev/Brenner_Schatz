import { useState, useEffect } from 'react'
import { Folder, Plus, Search } from 'lucide-react'

export function CaseSelector({ onSelect, cases }) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCases = cases.filter(c =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">LegalMind</h1>
                    <p className="text-xl text-muted-foreground">Select a case matter to begin analysis.</p>
                </div>

                <div className="bg-card border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors">
                            <Plus className="w-5 h-5" />
                            New Matter
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCases.map(caseId => (
                            <button
                                key={caseId}
                                onClick={() => onSelect(caseId)}
                                className="group flex flex-col items-start p-6 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all text-left"
                            >
                                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{caseId.replace(/_/g, ' ')}</h3>
                                <div className="text-sm text-muted-foreground">Last modified: Today</div>
                            </button>
                        ))}
                    </div>

                    {filteredCases.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No cases found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
