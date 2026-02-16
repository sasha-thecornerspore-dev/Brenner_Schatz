import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Paperclip, X, AlertTriangle, CheckCircle, BrainCircuit, ArrowRight } from 'lucide-react'
import { useCase } from '../context/CaseContext'

export function AssistantView({ onNavigate }) {
    const { selectedCase, addNote, aiAnalysis, notes, caseName } = useCase()
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello. I've analyzed your case files. How can I help you?", sender: 'AI', time: new Date() }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Original notes effect, kept for context integration
    useEffect(() => {
        if (messagesEndRef.current) { // Renamed from scrollRef
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
        }
    }, [notes])


    const handleSend = async () => {
        if (!inputValue.trim()) return

        const userQuery = inputValue
        setMessages(prev => [...prev, { id: Date.now(), text: userQuery, sender: 'User', time: new Date() }])
        addNote(userQuery, 'User') // Keep original addNote for context
        setInputValue('')
        setIsTyping(true)

        try {
            // Call Search API
            const res = await fetch(`/api/search?q=${encodeURIComponent(userQuery)}&caseId=${selectedCase}`)
            const data = await res.json()

            let responseText = "I couldn't find any specific documents matching that query in the case file."

            if (data.results && data.results.length > 0) {
                const topResult = data.results[0]
                const count = data.count

                // Construct a helpful response based on search results
                responseText = `I found ${count} matching documents. \n\n` +
                    `Top match: **${topResult.sourceFile || topResult.file}** (Line ${topResult.line})\n` +
                    `> "...${topResult.content}..."\n\n` +
                    `You can view full details in the Document Search tab.`
            }

            // Artificial delay for "thinking" feel
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'AI', time: new Date() }])
                setIsTyping(false)
                addNote(responseText, 'AI') // Keep original addNote for context
            }, 600)

        } catch (error) {
            console.error(error)
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble accessing the case files right now.", sender: 'AI', time: new Date() }])
                setIsTyping(false)
                addNote("I encountered an error searching the case file. Please try again.", 'AI') // Keep original addNote for context
            }, 600)
        }
    }

    return (
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
            {/* Strategic Plan (Left Panel) */}
            <div className="w-1/3 space-y-6">
                <div className="bg-card border border-white/5 rounded-xl p-6 h-full flex flex-col">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-purple-400" />
                        Strategic Analysis
                    </h2>

                    <div className="space-y-6 flex-1">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-muted-foreground mb-1">Case Status</div>
                            <div className="text-lg font-semibold">{aiAnalysis.status}</div>
                        </div>

                        <div className={`p-4 rounded-lg border ${aiAnalysis.riskLevel === 'High' ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                            <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
                            <div className={`text-lg font-semibold flex items-center gap-2 ${aiAnalysis.riskLevel === 'High' ? 'text-red-400' : 'text-green-400'}`}>
                                {aiAnalysis.riskLevel === 'High' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                {aiAnalysis.riskLevel}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="text-sm text-blue-300/80 mb-2 font-medium uppercase tracking-wide">Recommended Action</div>
                            <div className="text-blue-100 font-medium leading-relaxed mb-4">
                                {aiAnalysis.nextAction}
                            </div>

                            {/* Dynamic Action Buttons */}
                            <div className="flex flex-col gap-2">
                                {aiAnalysis.nextAction.includes('Motion') && (
                                    <button
                                        onClick={() => onNavigate && onNavigate('drafter')}
                                        className="w-full flex items-center justify-between px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors"
                                    >
                                        Draft This Motion
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => onNavigate && onNavigate('research')}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg text-sm transition-colors"
                                >
                                    View Legal Research
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {aiAnalysis.missingEvidence.length > 0 && (
                            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <div className="text-sm text-amber-500/80 mb-2 font-medium">Missing Critical Evidence</div>
                                <ul className="list-disc list-inside text-sm text-amber-200/80 space-y-1">
                                    {aiAnalysis.missingEvidence.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Interface (Right Panel) */}
            <div className="flex-1 bg-card border border-white/5 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{caseName} - Assistant</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Online & Aware
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {notes.length === 0 && (
                        <div className="text-center text-muted-foreground py-10 opacity-50">
                            <Bot className="w-12 h-12 mx-auto mb-3" />
                            <p>I am reviewing the file. Ask me anything about the strategy.</p>
                        </div>
                    )}
                    {notes.map((note, i) => (
                        <div key={i} className={`flex ${note.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${note.sender === 'User'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-white/10 rounded-tl-none'
                                }`}>
                                <p className="text-sm">{note.text}</p>
                                <div className="text-[10px] opacity-50 mt-1 text-right">
                                    {note.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about deadlines, missing documents, or strategy..."
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                            onClick={handleSend}
                            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
