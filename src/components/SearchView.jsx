import { useState } from 'react'
import { Search, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { useCase } from '../context/CaseContext'

export function SearchView() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const { selectedCase } = useCase()
    const [error, setError] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}&caseId=${selectedCase}`)
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setResults(data.results || [])
        } catch (error) {
            console.error("Search failed:", error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex gap-6">
            {/* Search Pane */}
            <div className={`flex-1 flex flex-col space-y-6 ${selectedFile ? 'hidden md:flex md:w-1/3' : 'w-full'}`}>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Search className="w-7 h-7 text-primary" />
                        Document Search
                    </h2>
                    <p className="text-muted-foreground mt-1">Search through all 2,000+ extracted case documents.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for keywords (e.g., 'affidavit', 'note', 'default')..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {results.length === 0 && !loading && !error && query && (
                        <div className="text-center text-muted-foreground py-10">No results found.</div>
                    )}

                    {results.map((result, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedFile(result)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedFile === result
                                ? 'bg-primary/10 border-primary'
                                : 'bg-card border-white/5 hover:bg-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="font-medium text-sm truncate">{result.file}</span>
                            </div>
                            <div className="text-sm text-muted-foreground bg-black/20 p-2 rounded font-mono text-xs overflow-x-auto">
                                ...{result.content}...
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                Line: {result.line}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Pane */}
            {selectedFile && (
                <div className="w-full md:w-2/3 h-full bg-card border border-white/10 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-2">
                            <File className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold truncate">{selectedFile.file}</h3>
                        </div>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto bg-white/5 font-mono text-sm whitespace-pre-wrap">
                        {/* 
                           Note: Since we are searching extracted text, we show the context snippet.
                           For a full file viewer, we would need to serve the original PDF/Image.
                           The current extracted text file path might not directly map to a served static file,
                           but we can show the extracted text context for now.
                        */}
                        <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                            <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Extracted Text Context</h4>
                            {selectedFile.context}
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-muted-foreground text-sm">
                                Full file preview requires mapping extracted text back to original source files.
                                <br />Current view shows extracted text context.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
